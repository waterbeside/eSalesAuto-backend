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
   * 
   */
  async save(){
    const { ctx, app } = this;    
    const Op = ctx.model.Op;

    let data = ctx.request.body.data;
    let customer_code = ctx.request.body.customer_code;
    let brand = ctx.request.body.brand;
    let garment_fty = ctx.request.body.garment_fty;

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

    //查找所有style_no
    let style_no_kv_list = _.groupBy(data,'style_no');
    let style_no_array = [];
    let style_no_checkExist= {};
    
    // console.log(style_no_array);
    // console.log(style_no_checkExist);
    let basePpoNo = await this.buildBasePpoNo();
    let errorMsgList = {};
    let Delivery = await ctx.model.MasterLeadTime.getDeliveryByCC(customer_code);//计算交期
    let Ship_Mode = await ctx.model.MasterShipMode.getShipModeByCC(customer_code);//计算Ship_Mode


    
      for(let style_no in style_no_kv_list){
        let transaction;
        try {
          transaction = await this.ctx.model.transaction(); //启用事务

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
            Rev_NO = parseInt(oldTitleItemData.Rev_NO) + 1 - 1;
          }else{
            //取得 流水号
            Serial_NO = await ctx.model.SppoTitle.buildSerialNo(); 
            if(!Serial_NO){
              errorMsgList[style_no] = '流水号创建失败';
              continue;
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
          // let addSppoTitleRes = await ctx.model.SppoTitle.create(sppo_title_data_item,{transaction});
          // if(oldTitleItemData){ //更改旧版本的is_active状态为  0 
          //   await ctx.model.SppoTitle.update({Is_Active:0},{where:{
          //     Style_No: style_no,
          //     ID:{[Op.ne]:addSppoTitleRes.ID }
          //   },transaction});
          // }

          //开始循环处理每个style_no里的各项内容
          for(let i in styleNoGroupItemList){
            let item = styleNoGroupItemList[i];
            console.log('item');
            // console.log(item);

            // 处理Gament_part
            // 2)	SPPO_GP_Del_Destination_Info(SPPO Garment Part, 客户面料Code，Delivery，Destination信息) 
            let oldGPItemData = await ctx.model.SppoGpDelDestinationInfo.findOne({where:{PPO_ID,Garment_Part:item.garment_part}});
            if(!oldGPItemData){
              let Unit = await this.getUnitByGP(item.garment_part);
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
              // let addSppoGpRes = await ctx.model.SppoGpDelDestinationInfo.create(sppo_GP_data_item,{transaction});
              console.log('sppo_GP_data_item')
              console.log(sppo_GP_data_item)
            }
            

            //3)	SPPO_Fabrication(面料具体信息)
            let oldFabData = await ctx.service.sppo.getSppoFabData(item.customer_fab_code,PPO_NO);
            if(!oldFabData){
              let sppo_fab_data_item = await ctx.service.sppo.getMasterFabDataByFC(item.customer_fab_code); 
              if(!sppo_fab_data_item){
                errorMsgList['sn_'+style_no+"_cfc_"+item.customer_fab_code] = '生成 SPPO_Fabrication 数据失败';
                continue;
              }
              sppo_fab_data_item.setDataValue('PPO_NO',PPO_NO);
              // let addSppoFabRes = await ctx.model.SppoFabrication.create(sppo_fab_data_item,{transaction});
              console.log('sppo_fab_data_item')
              console.log(sppo_fab_data_item)
            }else{
              console.log('oldFabData')
              console.log(oldFabData)
            }
            
            // 4)	SPPO_Collar_Cuff (领袖具体信息)
            let oldCollarCuffData = await ctx.service.sppo.getSppoCollarCuffData(item.customer_fab_code,PPO_NO);
            if(!oldCollarCuffData){
              let sppo_collarCuff_data_item = await ctx.service.sppo.getMasterCollarCuffDataByFC(item.customer_fab_code); 
              if(!sppo_collarCuff_data_item){
                errorMsgList['sn_'+style_no+"_cfc_"+item.customer_fab_code] = '生成 SPPO_Collar_Cuff 数据失败';
                continue;
              }
              sppo_collarCuff_data_item.setDataValue('PPO_NO',PPO_NO);
              // let addSppoCollarCuffRes = await ctx.model.SppoCollarCuff.create(sppo_collarCuff_data_item,{transaction});

              console.log('sppo_collarCuff_data_item')
              console.log(sppo_collarCuff_data_item)
              // break;
            }else{
              console.log('oldCollarCuffData')
              console.log(oldCollarCuffData)
            }

            
           


          }
        
          
        
          

          await transaction.commit();
      
          // return true
        } catch (e) {
          console.log(e)
          await transaction.rollback();
        
          // return false
        }


      }
     
     
    return false;

    //整理处理sppo_title的数据
    let sppo_data = [];
    data.forEach((item,index) => {
      
      
    });
    
    ctx.helper.asyncForEach(data,async (item,index)=>{
      console.log(item)
    })
    

    return ctx.body = data;

    // ctx.model.transaction(function (t) {
    //   // 在这里链接您的所有查询。 确保你返回他们。
    //   return User.create({
    //     firstName: 'Abraham',
    //     lastName: 'Lincoln'
    //   }, {transaction: t}).then(function (user) {
    //     return user.setShooter({
    //       firstName: 'John',
    //       lastName: 'Boothe'
    //     }, {transaction: t});
    //   });
    
    // }).then(function (result) {
    //   // 事务已被提交
    //   // result 是 promise 链返回到事务回调的结果
    // }).catch(function (err) {
    //   // 事务已被回滚
    //   // err 是拒绝 promise 链返回到事务回调的错误
    // });
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

  
  async getUnitByGP(garment_part){
    const { ctx, app } = this;   
    if(typeof(this.UnitsKeyList) == 'object' && typeof(this.UnitsKeyList[garment_part])!='undefined'){
      return this.UnitsKeyList[garment_part];
    }
    let Unit = await ctx.model.MasterUnit.getUnitByGP(garment_part);
    if(typeof(this.UnitsKeyList) != 'object'){
      this.UnitsKeyList = {};
    }
    if(Unit){
      this.UnitsKeyList[garment_part] = Unit;
      return Unit;
    }else{
      return '';
    }
  }

  async getSppoFabData(Customer_Fab_Code){

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
