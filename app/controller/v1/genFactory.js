'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class GenFactoryController extends BaseController {
  async getFactoryIds() {
    const { ctx ,app} = this;
    const res = await ctx.service.genFactory.getFactoryIDList();
    if(res.length == 0){
      return this.jsonReturn(20002,{list:[]},'No data');
    }
    return this.jsonReturn(0,{list:res},'Successfully');

  }


}



module.exports = GenFactoryController;
