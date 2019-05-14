'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class GoController extends BaseController {


  /**
   * GO列表
   */
  async index() {
    const { ctx, app } = this;    
    let go_no = ctx.request.query.go_no;
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
        {Updater: username}
      ]
    }
    if(go_no)  where.GO_NO = {[Op.like]:'%'+go_no+'%'};
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
      // ['Create_Time', 'DESC'],
      ['GO_NO', 'DESC'],
    ];
    //分页
    let limit = pagesize;
    let total = await ctx.model.GoTitle.count({where}); //计算总数
    let pagination = this.pagination({total,page,pagesize});
    let offset = pagination.offset;
    if(total == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
    }
    //查询
    let res = await ctx.model.GoTitle.findAll({where,order,offset,limit});
   
    // // console.log(res)
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
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
    return this.jsonReturn(0,returnData,'Successful');
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

    let successStyleNoList =[];
    let errorStyleNoList =[];
    let errorIndex =[];
    let errorMsgList = {};
    let hasError = 0;
    const userData = await this.getUserData();
    const username = userData.username;

    console.log(data)
    // console.log(typeof(data))
    // console.log(customer_code)
    // console.log(brand)

    if(typeof(data)!="object"){
      return this.jsonReturn(992,"请上传数据");
    }
    if(!customer_code){
      return this.jsonReturn(992,'请选择 Customer code');
    }
    if(!brand){
      return this.jsonReturn(992,'请选择 Brand');
    }

   
    for(let i in data){
      let otherdRowIndex = -1;
      otherdRowIndex = ctx.service.go.checkMustSame(data[i],data,['style_no','gmt_fty']);
      if( otherdRowIndex != -1){
        hasError = 1;
        errMsg =  "相同Style_No, 所有的GMT_FTY也要相同";
        break;
      }

      otherdRowIndex = ctx.service.go.checkMustSame(data[i],data,['style_no','fds_no']);
      if( otherdRowIndex != -1){
        hasError = 1;
        errMsg =  "相同Style_No, 所有的FDS_No也要相同";
        break;
      }
    }
    if(hasError){
      return this.jsonReturn(-1,errMsg);
    }


    //查找所有style_no
    let style_no_kv_list = _.groupBy(data,'style_no');
    let style_no_array = [];

    let GoTitleData_list_old = {};
    let GoTitleData_list_base = {};

    //查出基础数据和旧数据
    for(let Style_No in style_no_kv_list){
      let dataList = style_no_kv_list[Style_No];
      //查出基础数据
      let GMT_FTY = style_no_kv_list[Style_No][0].gmt_fty;
      let FDS_No = style_no_kv_list[Style_No][0].fds_no;
      GoTitleData_list_base[Style_No] = {
        GMT_FTY,FDS_No,
        baseGoNo  : await ctx.service.go.buildBaseGoNo(GMT_FTY),
      };

      //查找旧数据
      let oldTitleItemData  =  await ctx.model.GoTitle.findOne({where:{Style_No},order:[['Rev_NO', 'DESC']]});
      GoTitleData_list_old[Style_No] = oldTitleItemData; 
    }
    if(hasError){
      return this.jsonReturn(-1,errMsg);
    }

    console.log(GoTitleData_list_base);

    let transaction = await this.ctx.model.transaction(); //启用事务
    try {
      let Serial_NO_x = await ctx.model.GoTitle.buildSerialNo(); 
      console.log('Serial_NO_x')
      console.log(Serial_NO_x)
      for(let style_no in style_no_kv_list){
      /*********** GO_title ******/
        let dataList = style_no_kv_list[style_no]; 
      }
      await transaction.commit();      
    } catch (error) {
      console.log(error.message)
      await transaction.rollback();
      return this.jsonReturn(-1,error.message);
    }

    

    

    
  }

}



module.exports = GoController;
