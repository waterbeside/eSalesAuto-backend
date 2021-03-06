'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenFactoryController extends BaseController {
  async getFactoryIds() {
    const { ctx } = this;
    let type = ctx.request.query.type;
    type = type ? parseInt(type) : 0;
    const res = await ctx.service.genFactory.getFactoryIDList(type);
    if (res.length === 0) {
      return ctx.jsonReturn(20002, { list: [] }, 'No data');
    }
    return ctx.jsonReturn(0, { list: res }, 'Successfully');

  }


}


module.exports = GenFactoryController;
