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
      [Op.or]:[
        {Creater: username},
        {Last_Updater: username}
      ]
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
      ['Create_Time', 'ASC'],
      // ['PPO_NO', 'DESC'],
    ];
    //分页
    let limit = pagesize;
    let total = await ctx.model.SppoTitle.count({where}); //计算总数
    let pagination = this.pagination({total,page,pagesize});
    let offset = pagination.offset;
    if(total == 0){
      return ctx.jsonReturn(20002,{list:[],pagination},'No data');
    }
    //查询
    let res = await ctx.model.SppoTitle.findAll({where,order,offset,limit});
   
    // // console.log(res)
    if(res.length == 0){
      return ctx.jsonReturn(20002,{list:[],pagination},'No data');
    }
    
    let list = res.map((item,index) => {
      let newItem = Object.assign(item.dataValues);
      newItem.Create_Time = moment(item.Create_Time).valueOf();
      newItem.Update_Time = moment(item.Update_Time).valueOf();
      return newItem;
    });
    
    let returnData = {
      list,
      pagination
    };
    return ctx.jsonReturn(0,returnData,'Successful');
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
    return ctx.jsonReturn(0,{is_exist:res},'Successfully');
  }

  /**
   *  取得customer_fab_code列表
   */
  async getCustomerFabCodes(){
    const { ctx, app } = this;    
    let cacheKey = "sppo:customer_fab_codes";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }

    let list = [];
    let res = await ctx.model.MasterFabricationLN.findAll({
        group: ['Customer_Fab_Code'],
        attributes:['Customer_Fab_Code']
    });
    console.log(res)
    res.forEach(element => {
      let item = {
        customer_fab_code: element.Customer_Fab_Code,
        from:'fabrication'
      }
      list.push(item);
    });


    res = await ctx.model.MasterCollarCuffLN.findAll({
        group: ['Customer_Fab_Code'],
        attributes:['Customer_Fab_Code']
    });
    res.forEach(element => {
      let item = {
        customer_fab_code: element.Customer_Fab_Code,
        from:'collar_cuff'
      }
      list.push(item);
    });


    if(list.length > 0){
      await ctx.helper.setStoreData(cacheKey,list,60*60*24);
    }

    return ctx.jsonReturn(0,{list},'Successfully');

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
    let hasError = 0;
    const userData = await this.getUserData();
    const Creater = userData.username;

    // console.log(data)
    // console.log(typeof(data))
    // console.log(customer_code)
    // console.log(brand)
    // console.log(garment_fty)

    if(typeof(data)!="object"){
      return ctx.jsonReturn(992,"请上传数据");
    }
    if(!customer_code){
      return ctx.jsonReturn(992,'请选择 Customer code');
    }
    if(!brand){
      return ctx.jsonReturn(992,'请选择 Brand');
    }
    if(!garment_fty){
      return ctx.jsonReturn(992,'请选择 Garment Fty');
    }

    //查找所有style_no
    let style_no_kv_list = _.groupBy(data,'style_no');
    let style_no_array = [];
    let style_no_checkExist= {};
    
    // console.log(style_no_array);
    // console.log(style_no_checkExist);
    let basePpoNo = await ctx.service.sppo.buildBasePpoNo(Creater);
    let Delivery = await ctx.model.MasterLeadTime.getDeliveryByCC(customer_code);//计算交期
    let Ship_Mode = await ctx.model.MasterShipMode.getShipModeByCC(customer_code);//取得Ship_Mode
    let sppoTitleData_list_old = {};
    let data_sppoTitle_batch = [];
    for(let style_no in style_no_kv_list){
      let dataList = style_no_kv_list[style_no];
      //验证重复的 Garment_Part Customer_Fab_Code;
      if(!ctx.service.sppo.check_gp_cfc_same(dataList)){
        hasError = 1;
        errMsg =  "'相同Style_No, 相同Garment_Part, 只可以出现一个Customer_Fab_Code，请重新检查再提交'";
        break;
      }
      //检查是否有旧的sppo_title数据 （style_no）
      let oldTitleItemData  =  await ctx.model.SppoTitle.findOne({where:{Style_No:style_no},order:[['Rev_NO', 'DESC']]});
      sppoTitleData_list_old[style_no] = oldTitleItemData; 
    }
    if(hasError){
      return ctx.jsonReturn(-1,errMsg);
    }

  
    let transaction = await this.ctx.model.transaction(); //启用事务

    //查出所有
    try {
      let Serial_NO_x = await ctx.model.SppoTitle.buildSerialNo(); 
      for(let style_no in style_no_kv_list){
        /*********** SPPO_title ******/
        let dataList = style_no_kv_list[style_no];     
        style_no_array.push(style_no);
        let Serial_NO = '';
        let PPO_NO = '';
        let Rev_NO = 0;
        let Season = dataList[0].season;
        let Garment_Wash = dataList[0].garment_wash;

        // 1) 整理处理sppo_title的数据
        let data_sppoTitle_old =   sppoTitleData_list_old[style_no]; //查出原库是否存在这条数据

        if(data_sppoTitle_old){
          //取得 流水号
          Serial_NO = parseInt(data_sppoTitle_old.Serial_NO);
          //取得或生成 PPO_NO
          PPO_NO = data_sppoTitle_old.PPO_NO;
          Rev_NO = parseInt(data_sppoTitle_old.Rev_NO) + 1 ;
        }else{
          //取得 流水号
          Serial_NO = Serial_NO_x; 
          Serial_NO_x = Serial_NO_x + 1;
          if(!Serial_NO){
            errorMsgList[style_no]['all'] = '流水号创建失败';
            errorStyleNoList.push(style_no);
            hasError = 1;
            throw new Error(errorMsgList[style_no]['all']);
          }
          
          // 取得或生成 PPO_NO
          PPO_NO = basePpoNo + ctx.helper.prefixO(Serial_NO,5)
        }
        let PPO_ID = PPO_NO + '-' + Rev_NO;
        let data_sppoTitle_i = {
          Serial_NO,
          PPO_NO,
          Rev_NO,
          PPO_ID,
          Style_No:style_no,
          Season,
          Customer_Code:customer_code,
          Brand:brand,
          Garment_Wash,
          Is_Active:1,
        }
        if(data_sppoTitle_old){
          data_sppoTitle_i.Creater      = data_sppoTitle_old.Creater;
          data_sppoTitle_i.Create_Time  = data_sppoTitle_old.Create_Time;
          data_sppoTitle_i.Last_Updater = Creater;
          data_sppoTitle_i.Update_Time  = new Date();
        }else{
          data_sppoTitle_i.Creater      = Creater;
          data_sppoTitle_i.Create_Time  = new Date();
        }
        // sppoTitleData_list_old.push(data_sppoTitle_i);
        // console.log(data_sppoTitle_i);

        let addSppoTitleRes = await ctx.model.SppoTitle.create(data_sppoTitle_i,{transaction});
        if(data_sppoTitle_old){ //更改旧版本的is_active状态为  0 
          await ctx.model.SppoTitle.update({Is_Active:0},{where:{
            Style_No: style_no,
            ID:{[Op.ne]:addSppoTitleRes.ID }
          },transaction});
        }
        
        /***  ***/
        let sppoColorQty_lst_batchData = []; //5)
        let sppoColorQty_hasPush = [];
        let sppoGpDelDest_lst_batchData = []; //2)
        let sppoGpDelDest_hasPush = [];
        let sppoFabrication_lst_batchData = []; //3)
        let sppoFabrication_hasPush = [];
        let sppoCollarCuff_lst_batchData = []; //4)
        let sppoCollarCuff_hasPush = [];

        // var sppoGpDel_groupList = _.groupBy(dataList, function (n) { return n.name+" ++ "+n.score; });
        for(let i in dataList){
          let item = dataList[i];
          let Customer_Fab_Code = item.customer_fab_code
          let Garment_Part = item.garment_part

          let Unit = await ctx.service.sppo.getUnitByGP(Garment_Part);      
          let masterQtyData = await ctx.service.sppo.getMasterQtyData(Garment_Part); //先通过garmaent_part查是body还是领袖
          if(!masterQtyData){
            errorStyleNoList.push(style_no);
            throw new Error('Garment_Part Error: empty Master_Qty data');
          }
          let Garment_Part_CD = masterQtyData.Garment_Part_CD;
         

  
          /*********** SPPO_Color_Qty_Info ******/
          // 5) SPPO_Color_Qty_Info
          let sppoColorQtyInfo_pkey = 'GP_'+Garment_Part+'_CFC_'+Customer_Fab_Code+'_CC_'+item.color_combo;
          if(!sppoColorQty_hasPush.includes(sppoColorQtyInfo_pkey)){
            let color_combo_no = item.color_combo.substring(0,2);
            let newItem_SppoColorQtyInfo = {
              PPO_ID,
              Garment_Part,
              Customer_Fab_Code,
              Color_Combo           : item.color_combo,
              Fabric_Code_ESCM      : Customer_Fab_Code+'_'+color_combo_no,
              Qty                   : masterQtyData.Qty,
              LD_STD                : masterQtyData.LD_STD,
              Remark                : item.remark
            }
            sppoColorQty_lst_batchData.push(newItem_SppoColorQtyInfo);
            sppoColorQty_hasPush.push(sppoColorQtyInfo_pkey);
          }

           /*********** SPPO_GP_Del_Destination_Info ******/
          // 2) SPPO_GP_Del_Destination_Info
          let sppoGpDelDest_pkey = 'GP_'+Garment_Part+'_CFC_'+Customer_Fab_Code;
          if(!sppoGpDelDest_hasPush.includes(sppoGpDelDest_pkey)){
            let newItem_SppoGpDelDest = {
              PPO_ID,
              Garment_Part,
              Customer_Fab_Code,
              Delivery,
              Destination       :garment_fty,
              Ship_Mode,
              Unit,
              // Remark            :item.remark
            }
            sppoGpDelDest_lst_batchData.push(newItem_SppoGpDelDest);
            sppoGpDelDest_hasPush.push(sppoGpDelDest_pkey);
          }
          
  
          
          /*********** SPPO_Fabrication ******/
          let sppoFabrication_pkey = 'CFC_'+Customer_Fab_Code;
          if(Garment_Part_CD == 'B' && !sppoFabrication_hasPush.includes(sppoFabrication_pkey)) {
            //3)	SPPO_Fabrication(面料具体信息)
            let master_fab_data_item = await ctx.service.sppo.getMasterFabDataByFC(Customer_Fab_Code); 
            if(!master_fab_data_item){
              errorStyleNoList.push(style_no);
              throw new Error("生成 SPPO_Fabrication 数据失败，customer_fab_code："+Customer_Fab_Code+"找不到对应的Master_collar_cuff数据'");
            }
            let newItem_SppoFabrication = {
              // PPO_NO,
              PPO_ID,
              Customer_Fab_Code,
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
            sppoFabrication_lst_batchData.push(newItem_SppoFabrication);
            sppoFabrication_hasPush.push(sppoFabrication_pkey);
          }
          
  
          /*********** SPPO_Collar_Cuff ******/
          let sppoCollarCuff_pkey = 'CFC_'+Customer_Fab_Code;
          if(Garment_Part_CD == 'C' && !sppoCollarCuff_hasPush.includes(sppoCollarCuff_pkey) ) {
            // 4)	SPPO_Collar_Cuff (领袖具体信息)
            let master_collarCuff_data_item = await ctx.service.sppo.getMasterCollarCuffDataByFC(Customer_Fab_Code); 
            if(!master_collarCuff_data_item){
              errorStyleNoList.push(style_no);
              throw new Error('生成 SPPO_Collar_Cuff 数据失败，customer_fab_code：'+Customer_Fab_Code+'找不到对应的Master_collar_cuff数据');
            }
            let newItem_SppoCollarCuff = {
              PPO_ID,
              Customer_Fab_Code,
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
            sppoCollarCuff_lst_batchData.push(newItem_SppoCollarCuff);
            sppoCollarCuff_hasPush.push(sppoCollarCuff_pkey);  
          }
  
        }


        console.log('sppoGpDelDest_lst_batchData');
        console.log(sppoGpDelDest_lst_batchData);
        console.log('sppoColorQty_lst_batchData');
        console.log(sppoColorQty_lst_batchData);
        console.log('sppoFabrication_lst_batchData');
        console.log(sppoFabrication_lst_batchData);
        console.log('sppoCollarCuff_lst_batchData');
        console.log(sppoCollarCuff_lst_batchData);

        await ctx.model.SppoGpDelDestinationInfo.bulkCreate(sppoGpDelDest_lst_batchData,{transaction})
        await ctx.model.SppoColorQtyInfo.bulkCreate(sppoColorQty_lst_batchData,{transaction})
        await ctx.model.SppoFabrication.bulkCreate(sppoFabrication_lst_batchData,{transaction})
        await ctx.model.SppoCollarCuff.bulkCreate(sppoCollarCuff_lst_batchData,{transaction})
      }

      await transaction.commit();
    } catch(err){
      console.log(err.message)
      await transaction.rollback();
      
      return ctx.jsonReturn(-1,err.message);

    }
    let returnData={
      // msgList : errorMsgList,
      errorStyleNoList,
    }
    return ctx.jsonReturn(0,returnData);




    // for(let style_no in style_no_kv_list){
    //   console.log('style_no:'+style_no);
    //   let hasError = 0;
    //   errorMsgList[style_no] = {}
    //   let transaction = await this.ctx.model.transaction(); //启用事务
    //   try {

    //     // 1) 整理处理sppo_title的数据
    //     let styleNoGroupItemList = style_no_kv_list[style_no];
    //     let oldTitleItemData =  await ctx.model.SppoTitle.findOne({where:{Style_No:style_no},order:[['Serial_NO', 'DESC']]}); //查出原库是否存在这条数据

    //     style_no_checkExist[style_no] =oldTitleItemData;
    //     style_no_array.push(style_no);
    //     let Serial_NO = '';
    //     let PPO_NO = '';
    //     let Rev_NO = 0;
    //     let Season = styleNoGroupItemList[0].season;
    //     let Garment_Wash = styleNoGroupItemList[0].garment_wash;
    //     if(oldTitleItemData){
    //     //取得 流水号
    //       Serial_NO = parseInt(oldTitleItemData.Serial_NO);
    //       //取得或生成 PPO_NO
    //       PPO_NO = oldTitleItemData.PPO_NO;
    //       Rev_NO = parseInt(oldTitleItemData.Rev_NO) + 1 ;
    //     }else{
    //       //取得 流水号
    //       Serial_NO = await ctx.model.SppoTitle.buildSerialNo(); 
    //       if(!Serial_NO){
    //         errorMsgList[style_no]['all'] = '流水号创建失败';
    //         hasError = 1;
    //         throw new Error(errorMsgList[style_no]['all']);
    //         // continue;
    //         // return ctx.jsonReturn(-1,'流水号创建失败');
    //       }
    //       // 取得或生成 PPO_NO
    //       PPO_NO = basePpoNo + ctx.helper.prefixO(Serial_NO,5)
    //     }
    //     let PPO_ID = PPO_NO + '-' + Rev_NO;
    //     let sppo_title_data_item = {
    //       Serial_NO,
    //       PPO_NO,
    //       Rev_NO,
    //       PPO_ID,
    //       Style_No:style_no,
    //       Season,
    //       Customer_Code:customer_code,
    //       Brand:brand,
    //       Garment_Wash,
    //       Is_Active:1,
    //     }
    //     if(oldTitleItemData){
    //       sppo_title_data_item.Creater      = oldTitleItemData.Creater;
    //       sppo_title_data_item.Create_Time  = oldTitleItemData.Create_Time;
    //       sppo_title_data_item.Last_Updater = Creater;
    //       sppo_title_data_item.Update_Time  = new Date();
    //     }else{
    //       sppo_title_data_item.Creater      = Creater;
    //       sppo_title_data_item.Create_Time  = new Date();
    //     }
    //     // console.log(sppo_title_data_item);
    //     let addSppoTitleRes = await ctx.model.SppoTitle.create(sppo_title_data_item,{transaction});
    //     if(oldTitleItemData){ //更改旧版本的is_active状态为  0 
    //       await ctx.model.SppoTitle.update({Is_Active:0},{where:{
    //         Style_No: style_no,
    //         ID:{[Op.ne]:addSppoTitleRes.ID }
    //       },transaction});
    //     }
        
    //     /********** *********/
    //     //开始循环处理每个style_no里的各项内容
    //     let hasItemError = 0;
    //     for(let i in styleNoGroupItemList){
    //       let item = styleNoGroupItemList[i];
    //       console.log('item:'+i);
    //       let transaction2 = await this.ctx.model.transaction(); //启用事务
    //       try {
    //         // 处理Gament_part
    //         // 2)	SPPO_GP_Del_Destination_Info(SPPO Garment Part, 客户面料Code，Delivery，Destination信息) 
    //         let oldGPItemData = await ctx.service.sppo.getSppoGpDelDesData(item.garment_part,PPO_ID);
    //         if(!oldGPItemData){
    //           let Unit = await ctx.service.sppo.getUnitByGP(item.garment_part);
    //           let sppo_GP_data_item = {
    //             PPO_ID,
    //             Garment_Part:item.garment_part,
    //             Customer_Fab_Code:item.customer_fab_code,
    //             Delivery,
    //             Destination:garment_fty,
    //             Ship_Mode,
    //             Unit,
    //             Remark:item.remark
    //           }
    //           let addSppoGpRes = await ctx.model.SppoGpDelDestinationInfo.create(sppo_GP_data_item,{transaction:transaction2});
    //           console.log('2)addSppoGpRes');
    //         }else{
    //           console.log('2)addSppoGpRes jump');
    //         }

    //         // 5)	SPPO_Color_Qty_Info (颜色数量信息)
    //         let masterQtyData = await ctx.service.sppo.getMasterQtyData(item.garment_part); //先通过garmaent_part查是body还是领袖
    //         if(!masterQtyData){
    //           errorMsgList[style_no][i] = 'Garment_Part:'+item.garment_part+' 有误';
    //           hasError = 1;
    //           hasItemError = 1;
    //           throw new Error(errorMsgList[style_no][i]);
    //         }
    //         let Garment_Part_CD = masterQtyData.Garment_Part_CD;
    //         let oldColorQtyItemData = await ctx.service.sppo.getSppoColorQtyData(item.garment_part,PPO_ID);
    //         if(!oldColorQtyItemData){
    //           let color_combo_no = item.color_combo.substring(0,2);
    //           let sppo_color_qty_data_item = {
    //             PPO_ID,
    //             Garment_Part:item.garment_part,
    //             Customer_Fab_Code:item.customer_fab_code,
    //             Color_Combo:item.color_combo,
    //             Fabric_Code_ESCM: item.customer_fab_code+'_'+color_combo_no,
    //             Qty:masterQtyData.Qty,
    //             LD_STD:masterQtyData.LD_STD,
    //           }
    //           let addSppoColorQtyRes = await ctx.model.SppoColorQtyInfo.create(sppo_color_qty_data_item,{transaction:transaction2});
    //           console.log('5) addSppoColorQtyRes');
    //         }else{
    //           console.log('5) addSppoColorQtyRes jump');
    //         }
            
    //         if(Garment_Part_CD == 'B') {
    //           //3)	SPPO_Fabrication(面料具体信息)
    //           let oldFabData = await ctx.service.sppo.getSppoFabData(item.customer_fab_code,PPO_ID);
    //           if(!oldFabData){
    //             let master_fab_data_item = await ctx.service.sppo.getMasterFabDataByFC(item.customer_fab_code); 
    //             if(!master_fab_data_item){
    //               errorMsgList[style_no][i] = '生成 SPPO_Fabrication 数据失败，customer_fab_code：'+item.customer_fab_code+'找不到对应的Master_collar_cuff数据';
    //               hasError = 1;
    //               hasItemError = 1;
    //               throw new Error(errorMsgList[style_no][i]);
    //             }
    //             let sppo_fab_data_item = {
    //               // PPO_NO,
    //               PPO_ID,
    //               Customer_Fab_Code :   item.customer_fab_code,
    //               Refer_PPO_Usage   :   master_fab_data_item.Refer_PPO_Usage,
    //               Fab_Type          :   master_fab_data_item.Fab_Type,
    //               Fab_Pattern       :   master_fab_data_item.Fab_Pattern,
    //               Fab_Width         :   master_fab_data_item.Fab_Width,
    //               Finishing         :   master_fab_data_item.Finishing,
    //               Dye_Method        :   master_fab_data_item.Dye_Method,
    //               Weight_BW         :   master_fab_data_item.Weight_BW,
    //               Weight_AW         :   master_fab_data_item.Weight_AW,
    //               Shrinkage         :   master_fab_data_item.Shrinkage,
    //               Shrinkage_Test_Method   :   master_fab_data_item.Shrinkage_Test_Method,
    //               Yarn_Count        :   master_fab_data_item.Yarn_Count,
    //               Yarn_Strands      :   master_fab_data_item.Yarn_Strands,
    //               Yarn_Ratio        :   master_fab_data_item.Yarn_Ratio,
    //               Yarn_Type         :   master_fab_data_item.Yarn_Type,
    //               Fab_Desc          :   master_fab_data_item.Fab_Desc,
    //               Fab_Remark        :   master_fab_data_item.Fab_Remark,
    //             }

                
    //             let addSppoFabRes = await ctx.model.SppoFabrication.create(sppo_fab_data_item,{transaction:transaction2});
    //             console.log('3) addSppoFabRes');
    //           }
    //         }


    //         if(Garment_Part_CD == 'C') {
    //           // 4)	SPPO_Collar_Cuff (领袖具体信息)
    //           let oldCollarCuffData = await ctx.service.sppo.getSppoCollarCuffData(item.customer_fab_code,PPO_ID);
    //           if(!oldCollarCuffData){
    //             let master_collarCuff_data_item = await ctx.service.sppo.getMasterCollarCuffDataByFC(item.customer_fab_code); 
    //             if(!master_collarCuff_data_item){
    //               errorMsgList[style_no][i] = '生成 SPPO_Collar_Cuff 数据失败，customer_fab_code：'+item.customer_fab_code+'找不到对应的Master_collar_cuff数据';
    //               hasError = 1;
    //               hasItemError = 1;
    //               throw new Error(errorMsgList[style_no][i]);
    //             }
    //             let sppo_collarCuff_data_item = {
    //               PPO_ID,
    //               Customer_Fab_Code :   item.customer_fab_code,
    //               Refer_PPO_Usage   :   master_collarCuff_data_item.Refer_PPO_Usage,
    //               CC_Type           :   master_collarCuff_data_item.CC_Type,
    //               CC_Pattern        :   master_collarCuff_data_item.CC_Pattern,
    //               Size              :   item.collar_cuff_size,
    //               Finishing         :   master_collarCuff_data_item.Finishing,
    //               Dye_Method        :   master_collarCuff_data_item.Dye_Method,
    //               Yarn_Count        :   master_collarCuff_data_item.Yarn_Count,
    //               Yarn_Strands      :   master_collarCuff_data_item.Yarn_Strands,
    //               Yarn_Ratio        :   master_collarCuff_data_item.Yarn_Ratio,
    //               Yarn_Type         :   master_collarCuff_data_item.Yarn_Type,
    //               CC_Desc           :   master_collarCuff_data_item.CC_Desc,
    //               CC_Remark         :   master_collarCuff_data_item.CC_Remark,
    //             }
    //             let addSppoCollarCuffRes = await ctx.model.SppoCollarCuff.create(sppo_collarCuff_data_item,{transaction:transaction2});
    //             console.log('4) addSppoCollarCuffRes');
    //           }
    //         }
    //         await transaction2.commit();
    //       } catch(err){
    //         await transaction2.rollback();
    //         errorMsgList[style_no][i] = err.message;
    //         errorIndex.push(item.idx);
    //         hasError = 1;
    //         hasItemError = 1;
    //         // throw new Error(err.message);
    //       }
    //     }
    //     if(hasItemError){
    //       // 删表创建了对应PPO_ID的数据
    //       await ctx.model.SppoColorQtyInfo.destroy({where:{PPO_ID}})
    //       await ctx.model.SppoGpDelDestinationInfo.destroy({where:{PPO_ID}});
    //       await ctx.model.SppoCollarCuff.destroy({where:{PPO_ID}});
    //       throw new Error('添加style_no为'+style_no+' 的相关数据失败。');
    //     }
    //     await transaction.commit();
    //     successStyleNoList.push(style_no);
    //     // return true
    //   } catch (e) {
    //     console.log(e.message)
    //     errorMsgList[style_no]['all'] = '添加style_no为'+style_no+' 的相关数据失败。';
    //     errorStyleNoList.push(style_no);
    //     await transaction.rollback();
    //     // return false
    //   }    
    // }
    // let returnData={
    //   msgList : errorMsgList,
    //   successStyleNoList,
    //   errorStyleNoList,
    //   errorIndex
    // }
    // return ctx.jsonReturn(0,returnData);
    
  }


  /**
   * 编辑
   */
  async edit(){
    const { ctx, app } = this;   
    const Op = ctx.model.Op;

    let Delivery = ctx.request.body.delivery;
    let Destination = ctx.request.body.destination;
    let Garment_Wash = ctx.request.body.garment_wash;
    let Season = ctx.request.body.season;
    let PPO_NO = ctx.request.body.ppo_no;
    let dataList = ctx.request.body.data;

    const userData = await this.getUserData();
    const username = userData.username;

    let errorMsg = '';
    let hasError = 0;
    let errorData = {};
    if(!PPO_NO){
      return ctx.jsonReturn(-1,{errorData},'请选择要修改的数据');
    }
    
    //验证重复的 Garment_Part Customer_Fab_Code;
    if(!ctx.service.sppo.check_gp_cfc_same(dataList)){
      errorData = (ctx.service.sppo.errorData)
      return ctx.jsonReturn(-1,{errorData},'相同Style_No, 相同Garment_Part, 只可以出现一个Customer_Fab_Code，请重新检查再提交');
    }

    //查出旧数据
    let sppoData  = await ctx.service.sppo.getDetail(PPO_NO);
    if(!sppoData){
      return ctx.jsonReturn(20002,'数据不存在或已被删除');
    }
    let transaction = await this.ctx.model.transaction(); //启用事务
    try{
      /*********** SPPO_title ******/
      let sppoTitleData_old = sppoData.sppoTitle;
      let Style_No = sppoTitleData_old.Style_No;
      let Rev_NO_new = parseInt(sppoTitleData_old.Rev_NO)+1;
      let PPO_ID_new = PPO_NO+'-'+Rev_NO_new;
      // 1) sppo_title
      let sppo_title_data_item = Object.assign({},sppoTitleData_old.dataValues);
      sppo_title_data_item.Rev_NO = Rev_NO_new;
      sppo_title_data_item.PPO_ID = PPO_ID_new;
      sppo_title_data_item.Season = Season;
      sppo_title_data_item.Garment_Wash = Garment_Wash;
      sppo_title_data_item.Is_Active = 1;
      sppo_title_data_item.Last_Updater = username;
      sppo_title_data_item.Update_Time = new Date();
      delete(sppo_title_data_item.ID)
      console.log(sppo_title_data_item)
      let addSppoTitleRes = await ctx.model.SppoTitle.create(sppo_title_data_item,{transaction});
      await ctx.model.SppoTitle.update({Is_Active:0},{where:{
        Style_No: Style_No,
        ID:{[Op.ne]:addSppoTitleRes.ID }
      },transaction});

      let sppoColorQty_lst_batchData = []; //5)
      let sppoColorQty_hasPush = [];
      let sppoGpDelDest_lst_batchData = []; //2)
      let sppoGpDelDest_hasPush = [];
      let sppoFabrication_lst_batchData = []; //3)
      let sppoFabrication_hasPush = [];
      let sppoCollarCuff_lst_batchData = []; //4)
      let sppoCollarCuff_hasPush = [];

      let Ship_Mode = sppoData.sppoGpDelDest[0].Ship_Mode;

      for(let i in dataList){
        let item = dataList[i];

        let Unit = await ctx.service.sppo.getUnitByGP(item.Garment_Part);      

        let masterQtyData = await ctx.service.sppo.getMasterQtyData(item.Garment_Part); //先通过garmaent_part查是body还是领袖
        if(!masterQtyData){
          throw new Error('Garment_Part Error: empty Master_Qty data');
        }
        let Garment_Part_CD = masterQtyData.Garment_Part_CD;

        let Garment_Part = item.Garment_Part;
        let Customer_Fab_Code = item.Customer_Fab_Code;

        /*********** SPPO_Color_Qty_Info ******/
        // 5) SPPO_Color_Qty_Info
        let sppoColorQtyInfo_pkey = 'GP_'+Garment_Part+'_CFC_'+Customer_Fab_Code+'_CC_'+item.Color_Combo;
        if(!sppoColorQty_hasPush.includes(sppoColorQtyInfo_pkey)){
          let color_combo_no = item.Color_Combo.substring(0,2);
          let newItem_SppoColorQtyInfo = {
            PPO_ID:PPO_ID_new,
            Garment_Part,
            Customer_Fab_Code,
            Color_Combo         :item.Color_Combo,
            Fabric_Code_ESCM    : item.Customer_Fab_Code+'_'+color_combo_no,
            Qty                 :item.Qty,
            LD_STD              :item.LD_STD,
            Remark              :item.Remark
          }
          sppoColorQty_lst_batchData.push(newItem_SppoColorQtyInfo);
          sppoColorQty_hasPush.push(sppoColorQtyInfo_pkey);
        }


        /*********** SPPO_GP_Del_Destination_Info ******/
        // 2) SPPO_GP_Del_Destination_Info
        let sppoGpDelDest_pkey = 'GP_'+Garment_Part+'_CFC_'+Customer_Fab_Code;
        if(!sppoGpDelDest_hasPush.includes(sppoGpDelDest_pkey)){
          let newItem_SppoGpDelDest = {
            PPO_ID            :PPO_ID_new,
            Garment_Part ,
            Customer_Fab_Code,
            Delivery          :moment(Delivery).format('YYYY-MM-DD'),
            Destination,
            Ship_Mode,
            Unit,
          }
          sppoGpDelDest_lst_batchData.push(newItem_SppoGpDelDest);
          sppoGpDelDest_hasPush.push(sppoGpDelDest_pkey);
        }
       
        
        /*********** SPPO_Fabrication ******/
        let sppoFabrication_pkey = 'CFC_'+Customer_Fab_Code;
        if(Garment_Part_CD == 'B' && !sppoFabrication_hasPush.includes(sppoFabrication_pkey)) {
          //3)	SPPO_Fabrication(面料具体信息)
          let master_fab_data_item = await ctx.service.sppo.getMasterFabDataByFC(item.Customer_Fab_Code); 

          if(!master_fab_data_item){
            throw new Error("生成 SPPO_Fabrication 数据失败，customer_fab_code："+item.Customer_Fab_Code+"找不到对应的Master_collar_cuff数据'");
          }
          let newItem_SppoFabrication = {
            // PPO_NO,
            PPO_ID            :   PPO_ID_new,
            Customer_Fab_Code,
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
          sppoFabrication_lst_batchData.push(newItem_SppoFabrication);
          sppoFabrication_hasPush.push(sppoFabrication_pkey);
        }
        

        /*********** SPPO_Collar_Cuff ******/
        let sppoCollarCuff_pkey = 'CFC_'+Customer_Fab_Code;
        if(Garment_Part_CD == 'C') {
          // 4)	SPPO_Collar_Cuff (领袖具体信息)
          let master_collarCuff_data_item = await ctx.service.sppo.getMasterCollarCuffDataByFC(item.Customer_Fab_Code); 
          if(!master_collarCuff_data_item){
            throw new Error('生成 SPPO_Collar_Cuff 数据失败，customer_fab_code：'+item.Customer_Fab_Code+'找不到对应的Master_collar_cuff数据');
          }
          let newItem_SppoCollarCuff = {
            PPO_ID            :   PPO_ID_new,
            Customer_Fab_Code,
            Refer_PPO_Usage   :   master_collarCuff_data_item.Refer_PPO_Usage,
            CC_Type           :   master_collarCuff_data_item.CC_Type,
            CC_Pattern        :   master_collarCuff_data_item.CC_Pattern,
            Size              :   item.Collar_Cuff_Size,
            Finishing         :   master_collarCuff_data_item.Finishing,
            Dye_Method        :   master_collarCuff_data_item.Dye_Method,
            Yarn_Count        :   master_collarCuff_data_item.Yarn_Count,
            Yarn_Strands      :   master_collarCuff_data_item.Yarn_Strands,
            Yarn_Ratio        :   master_collarCuff_data_item.Yarn_Ratio,
            Yarn_Type         :   master_collarCuff_data_item.Yarn_Type,
            CC_Desc           :   master_collarCuff_data_item.CC_Desc,
            CC_Remark         :   master_collarCuff_data_item.CC_Remark,
          }
          sppoCollarCuff_lst_batchData.push(newItem_SppoCollarCuff);
          sppoCollarCuff_hasPush.push(sppoCollarCuff_pkey);  

        }

      }
      console.log('sppoGpDelDest_lst_batchData');
      console.log(sppoGpDelDest_lst_batchData);
      console.log('sppoColorQty_lst_batchData');
      console.log(sppoColorQty_lst_batchData);
      console.log('sppoFabrication_lst_batchData');
      console.log(sppoFabrication_lst_batchData);
      console.log('sppoCollarCuff_lst_batchData');
      console.log(sppoCollarCuff_lst_batchData);

      await ctx.model.SppoGpDelDestinationInfo.bulkCreate(sppoGpDelDest_lst_batchData,{transaction})
      await ctx.model.SppoColorQtyInfo.bulkCreate(sppoColorQty_lst_batchData,{transaction})
      await ctx.model.SppoFabrication.bulkCreate(sppoFabrication_lst_batchData,{transaction})
      await ctx.model.SppoCollarCuff.bulkCreate(sppoCollarCuff_lst_batchData,{transaction})

      await transaction.commit();
    } catch(err){
      console.log(err.message)
      await transaction.rollback();
      return ctx.jsonReturn(-1,{errorData},err.message);

    }


    return ctx.jsonReturn(0,'Successfully');
    
  }





  /**
   * 批量编辑
   */
  async batchEdit(){
    const { ctx, app } = this;   
    const Op = ctx.model.Op;

    let delivery = ctx.request.body.delivery;
    let destination = ctx.request.body.destination;
    let garment_wash = ctx.request.body.garment_wash;
    let season = ctx.request.body.season;
    let ppo_nos = ctx.request.body.ppo_nos;

    const userData = await this.getUserData();
    const username = userData.username;


    if(typeof(ppo_nos)!='object' || ppo_nos.length < 1){
      return ctx.jsonReturn(-1,'请选择要修改的数据')
    }
    // if(ppo_nos.length < 0) 
    // console.log(typeof(ppo_nos))
    let hasError = 0;
    let errorMsg = '';
    let sppoDataList = {};
    for(let i in ppo_nos){
      let PPO_NO = ppo_nos[i];
      let sppoData  = await ctx.service.sppo.getDetail(PPO_NO);
      if(!sppoData){
        hasError = 1;
        errorMsg = "PPO_NO："+PPO_NO+"对应的SPPO不存在，请重新选择后再试"
        break;  
      }
      sppoDataList[PPO_NO] = sppoData;
    }
    if(hasError){
      return ctx.jsonReturn(-1,errorMsg)
    }
    let transaction = await this.ctx.model.transaction(); //启用事务
    try{
      for(let PPO_NO in sppoDataList){
        let sppoData = sppoDataList[PPO_NO];
        let sppoTitleData_old = sppoData.sppoTitle;
        let Style_No = sppoTitleData_old.Style_No;
        let PPO_ID_old = sppoTitleData_old.PPO_ID;
        let Rev_NO_new = parseInt(sppoTitleData_old.Rev_NO)+1;
        let PPO_ID_new = PPO_NO+'-'+Rev_NO_new;
        /*********** SPPO_title ******/
        // 1) sppo_title
        let sppo_title_data_item = Object.assign({},sppoTitleData_old.dataValues);
        sppo_title_data_item.Rev_NO = Rev_NO_new;
        sppo_title_data_item.PPO_ID = PPO_ID_new;
        sppo_title_data_item.Season = season;
        sppo_title_data_item.Garment_Wash = garment_wash;
        sppo_title_data_item.Is_Active = 1;
        sppo_title_data_item.Last_Updater = username;
        sppo_title_data_item.Update_Time = new Date();
        delete(sppo_title_data_item.ID)
        
        console.log('sppo_title_data_item');
        console.log(sppo_title_data_item);
        let addSppoTitleRes = await ctx.model.SppoTitle.create(sppo_title_data_item,{transaction});
        await ctx.model.SppoTitle.update({Is_Active:0},{where:{
          Style_No: Style_No,
          ID:{[Op.ne]:addSppoTitleRes.ID }
        },transaction});


        /*********** SPPO_GP_Del_Destination_Info ******/
        // 2) SPPO_GP_Del_Destination_Info
        let sppoGpDelDest_lst = sppoData.sppoGpDelDest;
        if(sppoGpDelDest_lst && sppoGpDelDest_lst.length > 0){
          let sppoGpDelDest_lst_batchData = sppoGpDelDest_lst.map((rItem,index)=>{
            let newItem = Object.assign({},rItem.dataValues);
            newItem.PPO_ID = PPO_ID_new;
            newItem.Delivery = moment(delivery).format('YYYY-MM-DD');
            newItem.Destination = destination;
            delete(newItem.ID)
            return newItem;
          })
          console.log('sppoGpDelDest_lst_batchData');
          console.log(sppoGpDelDest_lst_batchData);
          await ctx.model.SppoGpDelDestinationInfo.bulkCreate(sppoGpDelDest_lst_batchData,{transaction})
        }
        

        /*********** SPPO_Color_Qty_Info ******/
        // 5) SPPO_Color_Qty_Info
        let sppoColorQty_lst = sppoData.sppoColorQty;
        if(sppoColorQty_lst && sppoColorQty_lst.length > 0){
          let sppoColorQty_lst_batchData = sppoColorQty_lst.map((rItem,index)=>{
            let newItem = Object.assign({},rItem.dataValues);
            newItem.PPO_ID = PPO_ID_new;
            delete(newItem.ID)
            return newItem;
          })
          console.log('sppoColorQty_lst_batchData');
          console.log(sppoColorQty_lst_batchData);
          await ctx.model.SppoColorQtyInfo.bulkCreate(sppoColorQty_lst_batchData,{transaction})
        }

        /*********** SPPO_Fabrication ******/
        // 3) SPPO_Fabrication
        let sppoFabrication_lst = sppoData.sppoFabrication;
        if(sppoFabrication_lst && sppoFabrication_lst.length > 0){
          let sppoFabrication_lst_batchData = sppoFabrication_lst.map((rItem,index)=>{
            let newItem = Object.assign({},rItem.dataValues);
            newItem.PPO_ID = PPO_ID_new;
            delete(newItem.ID)
            return newItem;
          })
          console.log('sppoFabrication_lst_batchData');
          console.log(sppoFabrication_lst_batchData);
          await ctx.model.SppoFabrication.bulkCreate(sppoFabrication_lst_batchData,{transaction})
        }

        /*********** SPPO_Collar_Cuff ******/
        // 4) SPPO_Collar_Cuff
        let sppoCollarCuff_lst = sppoData.sppoCollarCuff;
        if(sppoCollarCuff_lst && sppoCollarCuff_lst.length > 0){
          let sppoCollarCuff_lst_batchData = sppoCollarCuff_lst.map((rItem,index)=>{
            let newItem = Object.assign({},rItem.dataValues);
            newItem.PPO_ID = PPO_ID_new;
            delete(newItem.ID)
            return newItem;
          })
          console.log('sppoCollarCuff_lst_batchData');
          console.log(sppoCollarCuff_lst_batchData);
          await ctx.model.SppoCollarCuff.bulkCreate(sppoCollarCuff_lst_batchData,{transaction})
        }

      }
      await transaction.commit();
    } catch(err){
      console.log(err.message)
      hasError = 1;
      await transaction.rollback();
    }
    if(hasError){
      return ctx.jsonReturn(-1,'Failed');
    }else{
      return ctx.jsonReturn(0,'Successfully');
    }
    

  }

  


  /**
   * 详情
   */
  async detail(){
    const { ctx, app } = this;   
    let PPO_NO = ctx.request.query.ppo_no;
    
    let data = {}
    let res  = await ctx.service.sppo.getDetail(PPO_NO);
    if(!res){
      return ctx.jsonReturn(20002,{},'NO Data');
    }
    data = Object.assign({},res);
    let PPO_ID = data.sppoTitle.PPO_ID;
    data.itemList = []; 

    data.sppoColorQty.forEach((item,index)=>{
      let newItem = {};
      newItem.sppoColorQty = item;
      let sppoGpDelDest = _.filter(data.sppoColorQty,{PPO_ID,Garment_Part:item.Garment_Part});
      let sppoFabrication = _.filter(data.sppoFabrication,{PPO_ID,Customer_Fab_Code:item.Customer_Fab_Code});
      let sppoCollarCuff = _.filter(data.sppoCollarCuff,{PPO_ID,Customer_Fab_Code:item.Customer_Fab_Code});
      newItem.sppoGpDelDest = sppoGpDelDest && sppoGpDelDest.length > 0 ? sppoGpDelDest[0] : null;
      newItem.sppoFabrication = sppoFabrication && sppoFabrication.length > 0 ? sppoFabrication[0]: null;
      newItem.sppoCollarCuff = sppoCollarCuff && sppoCollarCuff.length > 0 ? sppoCollarCuff[0]: null;
      data.itemList.push(newItem);
    })

    return ctx.jsonReturn(0,data,'success');
    
  }
  


  
  /**
   * 删除数据
   */
  async del() {
    const { ctx, app } = this;    
    let ids = ctx.request.query.id ? ctx.request.query.id : ctx.request.body.id;

    if(!ids){
      return ctx.jsonReturn(-1,"请选择要删除的数据");
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
      return ctx.jsonReturn(-1,'你不能删除不是自己发布的内容');
    }

    where.Is_Active = 1;
    let res = await ctx.model.SppoTitle.update({Is_Active:0},{where});
    if(res && res[0]>0){
      return ctx.jsonReturn(0,'Successfully');
    }else{
      return ctx.jsonReturn(-1,'Failed');

    }
    
  }
}



module.exports = SppoController;
