'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class SppoController extends BaseController {


  /**
   * SPPO列表
   */
  async index() {
    const { ctx, app } = this;    
    let ppo_no = ctx.request.query.ppo_no;
    let season = ctx.request.query.season;
    let date_start = ctx.request.query.date_start ? parseInt(ctx.request.query.date_start) : 0;
    let date_end = ctx.request.query.date_end  ? parseInt(ctx.request.query.date_end) : 0;
    const userData = await this.getUserData();
    const username = userData.username;
    
   
    let pagesize = ctx.request.query.pagesize ? ctx.request.query.pagesize : 20;
    let page = ctx.request.query.page ? ctx.request.query.page : 1;
    //筛选
    const Op = ctx.model.Op;
    let where = {
      Is_Active: 1,
      // Creater: username,
    }
    if(ppo_no)  where.PPO_NO = {[Op.like]:'%'+ppo_no+'%'};
    if(season)  where.Season = {[Op.like]:'%'+season+'%'};
    if(date_start && date_end){
      where.Create_Time = {
        // [Op.gte]: new Date(date_start),
        // [Op.lt]: moment(date_end).add(1, 'd'),
        [Op.gte]: date_start,
        [Op.lt]: date_end+(1000*60*60*24)
      };
    }

    //排序
    let order = [
      ['Create_Time', 'DESC'],
    ];
    //分页
    let limit = pagesize;
    let total = await ctx.model.SppoTitle.count({where}); //计算总数
    let pagination = this.pagination({total,page,pagesize});
    let offset = pagination.offset;
    if(total == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
    }
    //查询
    let res = await ctx.model.SppoTitle.findAll({where,order,offset,limit});
   
    // // console.log(res)
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
    }
    
    let list = res.map((item,index) => {
      item.setDataValue('Create_Time',moment(item.Create_Time).valueOf());
      item.setDataValue('Update_Time',moment(item.Update_Time).valueOf());
      return item;
    });

    // console.log(list);
    
    let returnData = {
      list,
      pagination
    };
    return this.jsonReturn(0,returnData,'Successful');
  }

  /**
   * 验证 customer_fab_code 是否存在
   */
  async checkCustomerFabCodeExist(){
    const { ctx, app } = this;    
    let Customer_Fab_Code = ctx.request.query.customer_fab_code;
    let where = {
      Customer_Fab_Code
    }
    let res = await ctx.model.MasterFabricationLN.count({where});
    if(!res){
      res = await ctx.model.MasterCollarCuffLN.count({where});
    }
    return this.jsonReturn(0,{is_exist:res},'Successfully');
  }

 

  /**
   * 添加SPPO
   */
  async save(){
    const { ctx, app } = this;    
    const Op = ctx.model.Op;

    let data = ctx.request.body.data;
    let customer_code = ctx.request.body.customer_code;
    let brand = ctx.request.body.brand;
    let garment_fty = ctx.request.body.garment_fty;
    let successStyleNoList =[];
    let errorStyleNoList =[];
    let errorIndex =[];
    let errorMsgList = {};
    
    const userData = await this.getUserData();
    const Creater = userData.username;

    // console.log(data)
    // console.log(typeof(data))
    // console.log(customer_code)
    // console.log(brand)
    // console.log(garment_fty)

    if(typeof(data)!="object"){
      return this.jsonReturn(992,"请上传数据");
    }
    if(!customer_code){
      return this.jsonReturn(992,'请选择 Customer code');
    }
    if(!brand){
      return this.jsonReturn(992,'请选择 Brand');
    }
    if(!garment_fty){
      return this.jsonReturn(992,'请选择 Garment Fty');
    }
    // console.log(ctx.helper.asyncForEach)

    /****** test result  */
    // let returnData= {
    //   msgList : errorMsgList,
    //   successStyleNoList:['BB2001548'],
    //   errorStyleNoList:['BB2001560'],
    //   errorIndex
    // }
    // return this.jsonReturn(0,returnData);

    // console.log(data);return false;

    //查找所有style_no
    let style_no_kv_list = _.groupBy(data,'style_no');
    let style_no_array = [];
    let style_no_checkExist= {};
    
    // console.log(style_no_array);
    // console.log(style_no_checkExist);
    let basePpoNo = await this.buildBasePpoNo();
    let Delivery = await ctx.model.MasterLeadTime.getDeliveryByCC(customer_code);//计算交期
    let Ship_Mode = await ctx.model.MasterShipMode.getShipModeByCC(customer_code);//计算Ship_Mode


    for(let style_no in style_no_kv_list){
      console.log('style_no:'+style_no);
      let hasError = 0;
      errorMsgList[style_no] = {}
      let transaction = await this.ctx.model.transaction(); //启用事务
      try {

        // 1) 整理处理sppo_title的数据
        let styleNoGroupItemList = style_no_kv_list[style_no];
        let oldTitleItemData =  await ctx.model.SppoTitle.findOne({where:{Style_No:style_no},order:[['Serial_NO', 'DESC']]}); //查出原库是否存在这条数据

        style_no_checkExist[style_no] =oldTitleItemData;
        style_no_array.push(style_no);
        let Serial_NO = '';
        let PPO_NO = '';
        let Rev_NO = 0;
        let Season = styleNoGroupItemList[0].season;
        if(oldTitleItemData){
        //取得 流水号
          Serial_NO = parseInt(oldTitleItemData.Serial_NO);
          //取得或生成 PPO_NO
          PPO_NO = oldTitleItemData.PPO_NO;
          Rev_NO = parseInt(oldTitleItemData.Rev_NO) + 1 ;
        }else{
          //取得 流水号
          Serial_NO = await ctx.model.SppoTitle.buildSerialNo(); 
          if(!Serial_NO){
            errorMsgList[style_no]['all'] = '流水号创建失败';
            hasError = 1;
            throw new Error(errorMsgList[style_no]['all']);
            // continue;
            // return this.jsonReturn(-1,'流水号创建失败');
          }
          // 取得或生成 PPO_NO
          PPO_NO = basePpoNo + ctx.helper.prefixO(Serial_NO,5)
        }
        let PPO_ID = PPO_NO + '-' + Rev_NO;
        let sppo_title_data_item = {
          Creater,
          Serial_NO,
          PPO_NO,
          Create_Time:new Date(),
          Rev_NO,
          PPO_ID,
          Style_No:style_no,
          Season,
          Customer_Code:customer_code,
          Brand:brand,
          Is_Active:1,
        }
        if(oldTitleItemData){
          sppo_title_data_item.Last_Updater = Creater;
          sppo_title_data_item.Update_Time = new Date();
        }
        // console.log(sppo_title_data_item);
        let addSppoTitleRes = await ctx.model.SppoTitle.create(sppo_title_data_item,{transaction});
        if(oldTitleItemData){ //更改旧版本的is_active状态为  0 
          await ctx.model.SppoTitle.update({Is_Active:0},{where:{
            Style_No: style_no,
            ID:{[Op.ne]:addSppoTitleRes.ID }
          },transaction});
        }
        
        /********** *********/
        //开始循环处理每个style_no里的各项内容
        let hasItemError = 0;
        for(let i in styleNoGroupItemList){
          let item = styleNoGroupItemList[i];
          console.log('item:'+i);
          let transaction2 = await this.ctx.model.transaction(); //启用事务
          try {
            // 处理Gament_part
            // 2)	SPPO_GP_Del_Destination_Info(SPPO Garment Part, 客户面料Code，Delivery，Destination信息) 
            let oldGPItemData = await ctx.service.sppo.getSppoGpDelDesData(item.garment_part,PPO_ID);
            if(!oldGPItemData){
              let Unit = await ctx.service.sppo.getUnitByGP(item.garment_part);
              let sppo_GP_data_item = {
                PPO_ID,
                Garment_Part:item.garment_part,
                Customer_Fab_Code:item.customer_fab_code,
                Delivery,
                Destination:garment_fty,
                Ship_Mode,
                Unit,
                Remark:item.remark
              }
              let addSppoGpRes = await ctx.model.SppoGpDelDestinationInfo.create(sppo_GP_data_item,{transaction:transaction2});
              console.log('2)addSppoGpRes');
            }else{
              console.log('2)addSppoGpRes jump');
            }

            // 5)	SPPO_Color_Qty_Info (颜色数量信息)
            let masterQtyData = await ctx.service.sppo.getMasterQtyData(item.garment_part); //先通过garmaent_part查是body还是领袖
            if(!masterQtyData){
              errorMsgList[style_no][i] = 'Garment_Part:'+item.garment_part+' 有误';
              hasError = 1;
              hasItemError = 1;
              throw new Error(errorMsgList[style_no][i]);
            }
            let Garment_Part_CD = masterQtyData.Garment_Part_CD;
            let oldColorQtyItemData = await ctx.service.sppo.getSppoColorQtyData(item.garment_part,PPO_ID);
            if(!oldColorQtyItemData){
              let color_combo_no = item.color_combo.substring(0,2);
              let sppo_color_qty_data_item = {
                PPO_ID,
                Garment_Part:item.garment_part,
                Customer_Fab_Code:item.customer_fab_code,
                Color_Combo:item.color_combo,
                Fabric_Code_ESCM: item.customer_fab_code+'_'+color_combo_no,
                Qty:masterQtyData.Qty,
                LD_STD:masterQtyData.LD_STD,
              }
              let addSppoColorQtyRes = await ctx.model.SppoColorQtyInfo.create(sppo_color_qty_data_item,{transaction:transaction2});
              console.log('5) addSppoColorQtyRes');
            }else{
              console.log('5) addSppoColorQtyRes jump');
            }
            
            if(Garment_Part_CD == 'B') {
              //3)	SPPO_Fabrication(面料具体信息)
              let oldFabData = await ctx.service.sppo.getSppoFabData(item.customer_fab_code,PPO_NO);
              if(!oldFabData){
                let master_fab_data_item = await ctx.service.sppo.getMasterFabDataByFC(item.customer_fab_code); 
                if(!master_fab_data_item){
                  errorMsgList[style_no][i] = '生成 SPPO_Fabrication 数据失败，customer_fab_code：'+item.customer_fab_code+'找不到对应的Master_collar_cuff数据';
                  hasError = 1;
                  hasItemError = 1;
                  throw new Error(errorMsgList[style_no][i]);
                }
                let sppo_fab_data_item = {
                  PPO_NO,
                  Customer_Fab_Code :   item.customer_fab_code,
                  Refer_PPO_Usage   :   master_fab_data_item.Refer_PPO_Usage,
                  Fab_Type          :   master_fab_data_item.Fab_Type,
                  Fab_Pattern       :   master_fab_data_item.Fab_Pattern,
                  Fab_Width         :   master_fab_data_item.Fab_Width,
                  Finishing         :   master_fab_data_item.Finishing,
                  Dye_Method        :   master_fab_data_item.Dye_Method,
                  Weight_BW         :   master_fab_data_item.Weight_BW,
                  Weight_AW         :   master_fab_data_item.Weight_AW,
                  Shrinkage         :   master_fab_data_item.Shrinkage,
                  Shrinkage_Test_Method   :   master_fab_data_item.Shrinkage_Test_Method,
                  Yarn_Count        :   master_fab_data_item.Yarn_Count,
                  Yarn_Strands      :   master_fab_data_item.Yarn_Strands,
                  Yarn_Ratio        :   master_fab_data_item.Yarn_Ratio,
                  Yarn_Type         :   master_fab_data_item.Yarn_Type,
                  Fab_Desc          :   master_fab_data_item.Fab_Desc,
                  Fab_Remark        :   master_fab_data_item.Fab_Remark,
                }

                
                let addSppoFabRes = await ctx.model.SppoFabrication.create(sppo_fab_data_item,{transaction:transaction2});
                console.log('3) addSppoFabRes');
              }
            }


            if(Garment_Part_CD == 'C') {
              // 4)	SPPO_Collar_Cuff (领袖具体信息)
              let oldCollarCuffData = await ctx.service.sppo.getSppoCollarCuffData(item.customer_fab_code,PPO_ID);
              if(!oldCollarCuffData){
                let master_collarCuff_data_item = await ctx.service.sppo.getMasterCollarCuffDataByFC(item.customer_fab_code); 
                if(!master_collarCuff_data_item){
                  errorMsgList[style_no][i] = '生成 SPPO_Collar_Cuff 数据失败，customer_fab_code：'+item.customer_fab_code+'找不到对应的Master_collar_cuff数据';
                  hasError = 1;
                  hasItemError = 1;
                  throw new Error(errorMsgList[style_no][i]);
                }
                let sppo_collarCuff_data_item = {
                  PPO_ID,
                  Customer_Fab_Code :   item.customer_fab_code,
                  Refer_PPO_Usage   :   master_collarCuff_data_item.Refer_PPO_Usage,
                  CC_Type           :   master_collarCuff_data_item.CC_Type,
                  CC_Pattern        :   master_collarCuff_data_item.CC_Pattern,
                  Size              :   item.collar_cuff_size,
                  Finishing         :   master_collarCuff_data_item.Finishing,
                  Dye_Method        :   master_collarCuff_data_item.Dye_Method,
                  Yarn_Count        :   master_collarCuff_data_item.Yarn_Count,
                  Yarn_Strands      :   master_collarCuff_data_item.Yarn_Strands,
                  Yarn_Ratio        :   master_collarCuff_data_item.Yarn_Ratio,
                  Yarn_Type         :   master_collarCuff_data_item.Yarn_Type,
                  CC_Desc           :   master_collarCuff_data_item.CC_Desc,
                  CC_Remark         :   master_collarCuff_data_item.CC_Remark,
                }
                let addSppoCollarCuffRes = await ctx.model.SppoCollarCuff.create(sppo_collarCuff_data_item,{transaction:transaction2});
                console.log('4) addSppoCollarCuffRes');
              }
            }
            await transaction2.commit();
          } catch(err){
            await transaction2.rollback();
            errorMsgList[style_no][i] = err.message;
            errorIndex.push(item.idx);
            hasError = 1;
            hasItemError = 1;
            // throw new Error(err.message);
          }
        }
        if(hasItemError){
          // 删表创建了对应PPO_ID的数据
          await ctx.model.SppoColorQtyInfo.destroy({where:{PPO_ID}})
          await ctx.model.SppoGpDelDestinationInfo.destroy({where:{PPO_ID}});
          await ctx.model.SppoCollarCuff.destroy({where:{PPO_ID}});
          throw new Error('添加style_no为'+style_no+' 的相关数据失败。');
        }
        await transaction.commit();
        successStyleNoList.push(style_no);
        // return true
      } catch (e) {
        console.log(e.message)
        errorMsgList[style_no]['all'] = '添加style_no为'+style_no+' 的相关数据失败。';
        errorStyleNoList.push(style_no);
        await transaction.rollback();
        // return false
      }    
    }
    let returnData={
      msgList : errorMsgList,
      successStyleNoList,
      errorStyleNoList,
      errorIndex
    }
    return this.jsonReturn(0,returnData);
    
  }


  /**
   * 生成PPO_NO前部分
   */
  async buildBasePpoNo(){
    if(this.basePpoNo){
      console.log('cache')
      return this.basePpoNo;
    }
    const { ctx, app } = this;   
    const userData = await this.getUserData();
    const username = userData.username;
    const res = await ctx.service.genUsers.getDepartmentIdByUsername(username);
    if(!res){
      return false;
    }
    let sales_team  = res.DEPARTMENT_ID;
    let sales_team_code = sales_team.substring(0,1);
    let year_no = moment().format('YY');
    let basePpoNo = 'KSF'+year_no+sales_team_code+sales_team;
    this.basePpoNo = basePpoNo;
    return basePpoNo;
  }

  /**
   * 编辑
   */
  async edit(){

  }

  /**
   * 批量编辑
   */
  async batchEdit(){
    

  }

  /**
   * 创建一个 PPO_NO
   */
  async buildPpoNo(){
    const { ctx, app } = this;   
    let res = await ctx.model.SppoTitle.buildSerialNo();
    if(!res){
      return false;
    }
    let SerialNo =  ctx.helper.prefixO(res,5);
    let basePpoNo = await this.buildBasePpoNo();
    return basePpoNo+SerialNo;
  }


  /**
   * 详情
   */
  async detail(){
    const { ctx, app } = this;   
    let ppo_no = ctx.request.query.ppo_no;
    
    let data = {}
    data.sppoTitle = await ctx.model.SppoTitle.findOne({
      where:{PPO_NO:ppo_no,Is_Active:1},
      order:[['Rev_NO','DESC']]
    });
    if(!data.sppoTitle){
      return this.jsonReturn(20002,{},'NO Data');
    }
    let PPO_ID = data.sppoTitle.PPO_ID;
    let PPO_NO = data.sppoTitle.PPO_NO;
    data.sppoTitle.setDataValue('Create_Time',moment(data.sppoTitle.Create_Time).valueOf());
    data.sppoTitle.setDataValue('Update_Time',moment(data.sppoTitle.Update_Time).valueOf());

    data.sppoGpDelDest = await ctx.model.SppoGpDelDestinationInfo.findAll({
      where:{PPO_ID},
    });

    data.sppoColorQty = await ctx.model.SppoColorQtyInfo.findAll({
      where:{PPO_ID},
    });

    data.sppoFabrication = await ctx.model.SppoFabrication.findAll({
      where:{PPO_NO},
    });

    data.sppoCollarCuff = await ctx.model.SppoCollarCuff.findAll({
      where:{PPO_ID},
    });

    data.itemList = []; 
    data.sppoGpDelDest.forEach((item,index)=>{
      let newItem = {};
      newItem.sppoGpDelDest = item;
      newItem.sppoColorQty =_.filter(data.sppoColorQty,{PPO_ID,Garment_Part:item.Garment_Part});
      newItem.sppoFabrication =_.filter(data.sppoFabrication,{PPO_NO,Customer_Fab_Code:item.Customer_Fab_Code});
      newItem.sppoCollarCuff =_.filter(data.sppoCollarCuff,{PPO_ID,Customer_Fab_Code:item.Customer_Fab_Code});
      data.itemList.push(newItem);
    })

    return this.jsonReturn(0,data,'success');
    

    
  }
  


  
  /**
   * 删除数据
   */
  async del() {
    const { ctx, app } = this;    
    let ids = ctx.request.query.id ? ctx.request.query.id : ctx.request.body.id;

    if(!ids){
      return this.jsonReturn(-1,"请选择要删除的数据");
    }
    const userData = await this.getUserData();
    const username = userData.username;

    let idsArray = ids.toString().split(',');
    
    
    const Op = ctx.model.Op;
    let where = {
      ID:{
        [Op.in]:idsArray,
      },
      // Creater: username,
    }
    let list = await ctx.model.SppoTitle.findAll({where});
    if(list.length === 0){
      return this.jsonReturn(-1,'你不能删除不是自己发布的内容');
    }

    where.Is_Active = 1;
    let res = await ctx.model.SppoTitle.update({Is_Active:0},{where});
    if(res && res[0]>0){
      return this.jsonReturn(0,'Successfully');
    }else{
      return this.jsonReturn(-1,'Failed');

    }
    
  }
}



module.exports = SppoController;
