'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenWashTypeController extends BaseController {
  async checkExist() {
    const { ctx } = this;
    let wash_type = ctx.request.query.wash_type;
    let garment_wash = ctx.request.query.garment_wash;
    garment_wash = garment_wash ? garment_wash :wash_type ;
    const res = await ctx.service.genWashType.checkExistByWashType(garment_wash);
    return this.jsonReturn(0,{is_exist:res},'Successfully');
  }

}



module.exports = GenWashTypeController;
