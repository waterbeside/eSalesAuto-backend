'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterGoMarketController extends BaseController {

  async index() {
    const { ctx } = this;
    console.log(1111)
    let cacheKey = "master:goMarket:list";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return ctx.jsonReturn(0,{list:cacheData},'Successfully');;
    }
    const res = await ctx.model.MasterGoMarket.findAll();
    if(!res){
      return ctx.jsonReturn(20002,{list:[]},'No data');
    }
    await ctx.helper.setStoreData(cacheKey,res,60*60);
    return ctx.jsonReturn(0,{list:res},'Successfully');;
  }

}
module.exports = MasterGoMarketController;