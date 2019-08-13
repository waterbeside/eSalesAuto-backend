'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterSizeController extends BaseController {

  async getSizes() {
    const { ctx } = this;
    const customer_code = ctx.request.query.customer_code;
    const size = await ctx.service.masterSize.getSizesByCustomerCode(customer_code);
    const returnData = {
      size,
    };
    if (size.length === 0) {
      return ctx.jsonReturn(20002, { size: [] }, 'No data');
    }
    return ctx.jsonReturn(0, returnData, 'Successfully');
  }

}
module.exports = MasterSizeController;
