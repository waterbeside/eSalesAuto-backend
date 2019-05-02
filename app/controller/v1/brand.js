'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class BrandController extends BaseController {
  async index() {
    const { ctx } = this;
    let customer_code = ctx.request.query.customer_code;
    
    const res = await ctx.service.genBrand.findAllByCustomerCode(customer_code,'BRAND_CD,CUSTOMER_CD,NAME');
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[]},'No data');
    }
    return this.jsonReturn(0,{list:res},'Successfully');

  }


}



module.exports = BrandController;
