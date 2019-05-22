'use strict';

const BaseService = require('./Base');
class RoleService extends BaseService {
  
  async getSelects() {
    const { ctx, app } = this;   
    let cacheKey = "role:selects";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await ctx.model.Role.getSelects();
    if(!res){
      return [];
    }
    await ctx.helper.setStoreData(cacheKey,res,60*10);
    return res;
  }
}

module.exports = RoleService;