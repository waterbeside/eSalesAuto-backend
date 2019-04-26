'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');

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
