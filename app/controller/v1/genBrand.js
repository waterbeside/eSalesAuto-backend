'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenBrandController extends BaseController {
  async getBrandCode() {
    const { ctx } = this;
    const customer_code = ctx.request.query.customer_code;

    const res = await ctx.service.genBrandLabel.getBrandCDByCustomerCode(customer_code);
    if (res.length === 0) {
      return ctx.jsonReturn(20002, { list: [] }, 'No data');
    }
    return ctx.jsonReturn(0, { list: res }, 'Successfully');

  }


}


module.exports = GenBrandController;
