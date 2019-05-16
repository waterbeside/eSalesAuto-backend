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