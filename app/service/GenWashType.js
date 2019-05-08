'use strict';

const BaseService = require('./Base');
class GenWashTypeService extends BaseService {
  async checkExistByWashType(washType='') {
    if(!washType){
      return 0;
    }
    let sql = "SELECT COUNT(*) as c FROM  escmowner.GEN_WASH_TYPE WHERE WASH_TYPE_DESC = '"+washType+"'";
    let res = await this.ctx.model2.query(sql);
    console.log(res[0][0].c);
    return res[0][0].c;
  }

  
  async washTypeList(){
    const { ctx , app} = this;
    let cacheKey = "escm:gen_wash_type:wash_type_desc_list";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    let sql = "SELECT DISTINCT WASH_TYPE_DESC FROM  escmowner.GEN_WASH_TYPE ORDER BY WASH_TYPE_DESC";
    let res = await this.ctx.model2.query(sql);
    let returnData = [];
    res[0].forEach(item=>{
      returnData.push(item.WASH_TYPE_DESC);
    });
    await ctx.helper.setStoreData(cacheKey,returnData,60*60*12);
    return returnData;
  }
}

module.exports = GenWashTypeService;
