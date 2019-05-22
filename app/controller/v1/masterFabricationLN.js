'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterFabricationLNController extends BaseController {

  async index() {
    const { ctx } = this;
    let list =  await ctx.model.MasterFabricationLN.findAll();
    let returnData = {
      list,
    };
    if(list.length == 0){
      return this.jsonReturn(20002,{list:[]},'No data');
    }
    return this.jsonReturn(0,returnData,'Successful');
  }


  async getCustomerFabCodes(){
    const { ctx, app } = this;    
    let cacheKey = "master:fabricationLN:customer_fab_codes";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return this.jsonReturn(0,{list:cacheData},'Successfully');
    }

    let list = [];
    let res = await ctx.model.MasterFabricationLN.findAll(
      {
        group: ['Customer_Fab_Code'],
        attributes:['Customer_Fab_Code']
      }
    );
    res.forEach(item => {
      list.push(item.Customer_Fab_Code);
    });

    if(list.length > 0){
      await ctx.helper.setStoreData(cacheKey,list,60*60*24);
    }

    return this.jsonReturn(0,{list},'Successfully');

  }


  async checkExist() {
    const { ctx } = this;
    let Customer_Fab_Code = ctx.request.query.customer_fab_code;
    let where = {
      Customer_Fab_Code
    }
    const res = await ctx.model.MasterFabricationLN.count({where});
    return this.jsonReturn(0,{is_exist:res},'Successfully');
  }
}
module.exports = MasterFabricationLNController;