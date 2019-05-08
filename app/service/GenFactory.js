'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenFactoryService extends BaseService {
  async getFactoryIDList() {
    // const connection = await this.app.oracle.getConnection();
    // const res = await connection.execute("SELECT DISTINCT FACTORY_ID FROM GEN_FACTORY FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL ORDER BY DECODE(FI.FACTORY_ID,'TDC','1',FI.FACTORY_ID)");
    // connection.close();
    // let returnData = [];
    // res.rows.forEach(item => {
    //   returnData.push(item[0]);
    // });
    // console.log(returnData)
    // return returnData;

    const { ctx , app} = this;
    let cacheKey = "escm:gen_factorory:factory_id_list";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    let sql = "SELECT DISTINCT FACTORY_ID FROM [escmowner].[GEN_FACTORY] FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL"
    let res = await this.ctx.model2.query(sql);
    let returnData = [];
    res[0].forEach(item=>{
      returnData.push(item.FACTORY_ID);
    });
    await ctx.helper.setStoreData(cacheKey,returnData,60*60*12);
    return returnData;

  }
}

module.exports = GenFactoryService;
