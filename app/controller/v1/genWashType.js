'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenWashTypeController extends BaseController {
  async checkExist() {
    const { ctx } = this;
    const wash_type = ctx.request.query.wash_type;
    let garment_wash = ctx.request.query.garment_wash;
    garment_wash = garment_wash ? garment_wash : wash_type;
    const res = await ctx.service.genWashType.checkExistByWashType(garment_wash);
    return ctx.jsonReturn(0, {
      is_exist: res,
    }, 'Successfully');
  }


  async getWashTypes() {
    const { ctx } = this;
    const res = await ctx.service.genWashType.washTypeList();
    if (res.length === 0) {
      return ctx.jsonReturn(20002, {
        list: [],
      }, 'No data');
    }
    return ctx.jsonReturn(0, {
      list: res,
    }, 'Successfully');

  }

}

module.exports = GenWashTypeController;
