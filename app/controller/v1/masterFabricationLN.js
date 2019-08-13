'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterFabricationLNController extends BaseController {

  async index() {
    const { ctx } = this;
    const list = await ctx.model.MasterFabricationLN.findAll();
    const returnData = {
      list,
    };
    if (list.length === 0) {
      return ctx.jsonReturn(20002, { list: [] }, 'No data');
    }
    return ctx.jsonReturn(0, returnData, 'Successful');
  }


  async getCustomerFabCodes() {
    const { ctx, app } = this;
    const cacheKey = 'master:fabricationLN:customer_fab_codes';
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return ctx.jsonReturn(0, { list: cacheData }, 'Successfully');
    }

    const list = [];
    const res = await ctx.model.MasterFabricationLN.findAll(
      {
        group: [ 'Customer_Fab_Code' ],
        attributes: [ 'Customer_Fab_Code' ],
      }
    );
    res.forEach(item => {
      list.push(item.Customer_Fab_Code);
    });

    if (list.length > 0) {
      await ctx.helper.setStoreData(cacheKey, list, 60 * 60 * 24);
    }

    return ctx.jsonReturn(0, { list }, 'Successfully');

  }


  async checkExist() {
    const { ctx } = this;
    const Customer_Fab_Code = ctx.request.query.customer_fab_code;
    const where = {
      Customer_Fab_Code,
    };
    const res = await ctx.model.MasterFabricationLN.count({ where });
    return ctx.jsonReturn(0, { is_exist: res }, 'Successfully');
  }
}
module.exports = MasterFabricationLNController;
