'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class FabFabricTypeController extends BaseController {
  async checkExist() {
    const { ctx } = this;
    let garment_part = ctx.request.query.garment_part;
    const res = await ctx.service.fabFabricType.checkExistByFabricTypeCode(garment_part);
    
    return ctx.jsonReturn(0,{is_exist:res},'Successfully');

  }


}



module.exports = FabFabricTypeController;
