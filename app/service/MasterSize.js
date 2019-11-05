'use strict';

const BaseService = require('./Base');
class MasterSizeService extends BaseService {

  async getSizesByCustomerCode(Customer_Code, exp = 60) {
    const { ctx } = this;
    const cacheKey = 'master:size:array:CC_' + Customer_Code;
    const cacheData = await ctx.helper.cache(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.model.MasterSize.getByCustomerCode(Customer_Code);
    if (!res) {
      return [];
    }
    const data = [];
    res.forEach(item => {
      data.push(item.Size);
    });
    if (typeof (exp) === 'number' && exp > -1) {
      await ctx.helper.cache(cacheKey, data, exp);
    }
    return data;
  }
}

module.exports = MasterSizeService;
