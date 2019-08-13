'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenFactoryService extends BaseService {

  /**
   * 查询factory list
   * @param {int} type  when type = 1 then for GO
   */
  async getFactoryIDList(type = 0) {
    // const connection = await this.app.oracle.getConnection();
    // const res = await connection.execute("SELECT DISTINCT FACTORY_ID FROM GEN_FACTORY FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL ORDER BY DECODE(FI.FACTORY_ID,'TDC','1',FI.FACTORY_ID)");
    // connection.close();
    // let returnData = [];
    // res.rows.forEach(item => {
    //   returnData.push(item[0]);
    // });
    // console.log(returnData)
    // return returnData;

    const { ctx, app } = this;
    const cacheKey = 'escm:gen_factorory:factory_id_list_' + type;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const whereMore = type === 1 ? ' AND FI.FTY_ID_FOR_GO IS NOT NULL' : '';
    const sql = "SELECT DISTINCT FACTORY_ID FROM [escmowner].[GEN_FACTORY] FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL " + whereMore;
    const res = await this.ctx.model2.query(sql);
    const returnData = [];
    res[0].forEach(item => {
      returnData.push(item.FACTORY_ID);
    });
    await ctx.helper.setStoreData(cacheKey, returnData, 60 * 60 * 12);
    return returnData;

  }

  async getFactorysByFtyID(gmt_fty) {
    const { ctx, app } = this;
    const cacheKey = 'escm:genFactory:fty_' + gmt_fty;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const Op = ctx.model2.Op;
    const where = {
      ACTIVE: 'Y',
      INTERNAL_FLAG: 'Y',
      OU: {
        [Op.ne]: null,
      },
      FTY_ID_FOR_GO: {
        [Op.ne]: null,
      },
      FACTORY_ID: gmt_fty,
    };
    // let order = [['FACTORY_ID','DESC']]
    const res = await ctx.model2.GenFactory.findOne({ where });
    if (!res) {
      return false;
    }
    const resData = res.dataValues;

    // let sql = "SELECT DISTINCT FI.FTY_ID_FOR_GO  FROM [ESCM_EEL].[escmowner].[GEN_FACTORY] FI  WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL AND FI.FTY_ID_FOR_GO IS NOT NULL AND FI.FACTORY_ID = '"+gmt_fty+"' "
    // let res = await this.ctx.model2.query(sql);
    // let resData = res[0][0];
    // console.log(res);
    await ctx.helper.setStoreData(cacheKey, resData, 60 * 60 * 2);
    return resData;

  }

}

module.exports = GenFactoryService;
