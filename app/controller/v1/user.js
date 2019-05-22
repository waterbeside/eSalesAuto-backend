'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class UserController extends BaseController {


  /**
   * user list
   */
  async index() {
    const { ctx, app } = this;    
    let keyword = ctx.request.query.keyword;
    let date_start = ctx.request.query.date_start ? parseInt(ctx.request.query.date_start) : 0;
    let date_end = ctx.request.query.date_end  ? parseInt(ctx.request.query.date_end) : 0;
    const userData = await this.getUserData();
    const username = userData.username;
    
    let pagesize = ctx.request.query.pagesize ? ctx.request.query.pagesize : 20;
    let page = ctx.request.query.page ? ctx.request.query.page : 1;
    //筛选
    const Op = ctx.model.Op;
    let where = {
      is_delete: 0,
    }
    if(keyword){
      where[Op.or] = [
        {username: {[Op.like]:'%'+keyword+'%'}},
        {FullName: {[Op.like]:'%'+keyword+'%'}},
      ]
    }
    if(date_start && date_end){
      where.create_time = {
        [Op.gte]: date_start,
        [Op.lt]: date_end+(1000*60*60*24)
      };
    }
    //字段
    let attributes = ['id','username','status','roles','sales_team','FullName','create_time','last_login_time']

    //排序
    let order = [
      ['id', 'ASC'],
    ];
    //分页
    let limit = pagesize;
    let total = await ctx.model.User.count({where}); //计算总数
    let pagination = this.pagination({total,page,pagesize});
    let offset = pagination.offset;
    if(total == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
    }
    //查询
    let res = await ctx.model.User.findAll({where,order,offset,limit,attributes});
   
    // // console.log(res)
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[],pagination},'No data');
    }
    
    let list = res.map((item,index) => {
      let newItem = Object.assign(item.dataValues);
      newItem.create_time = moment(item.create_time).valueOf();
      newItem.last_login_time = moment(item.last_login_time).valueOf();
      return newItem;
    });
    
    let returnData = {
      list,
      pagination
    };
    return this.jsonReturn(0,returnData,'Successfully');
  }


  /**
   * 明细
   */
  async detail(){
    const { ctx, app } = this;    
    let id = parseInt(ctx.params.id);
    if(id < 1){
      return this.jsonReturn(992,{},'Lost ID');
    }
    let attributes = ['id','username','status','roles','sales_team','FullName','create_time','last_login_time']
    let where = {id,is_delete:0}
    let res  = await ctx.model.User.findOne({
      where,attributes
    })
    return this.jsonReturn(0,res,'Successfully');

  }

}



module.exports = UserController;
