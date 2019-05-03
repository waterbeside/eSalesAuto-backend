'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenBrandController extends BaseController {
  async getBrandCode() {
    const { ctx } = this;
    let customer_code = ctx.request.query.customer_code;
    
    const res = await ctx.service.genBrandLabel.getBrandCDByCustomerCode(customer_code);
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[]},'No data');
    }
    return this.jsonReturn(0,{list:res},'Successfully');

  }


}



module.exports = GenBrandController;
