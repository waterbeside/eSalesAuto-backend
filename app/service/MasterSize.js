'use strict';

const BaseService = require('./Base');
class MasterSizeService extends BaseService {

  async getSizesByCustomerCode(Customer_Code) {
    const { ctx, app } = this;
    const cacheKey = 'master:size:array:CC_' + Customer_Code;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
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
    await ctx.helper.setStoreData(cacheKey, data, 60 * 10);
    return data;
  }
}

module.exports = MasterSizeService;
