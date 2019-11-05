'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenFactoryService extends BaseService {

  /**
   * 查询factory list
   * @param {number} type  when type = 1 then for GO
   * @param {number} exp  缓存时间
   */
  async getFactoryIDList(type = 0, exp = 60 * 60) {
    // const connection = await this.app.oracle.getConnection();
    // const res = await connection.execute("SELECT DISTINCT FACTORY_ID FROM GEN_FACTORY FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL ORDER BY DECODE(FI.FACTORY_ID,'TDC','1',FI.FACTORY_ID)");
    // connection.close();
    // let returnData = [];
    // res.rows.forEach(item => {
    //   returnData.push(item[0]);
    // });
    // console.log(returnData)
    // return returnData;

    const { ctx } = this;
    const cacheKey = 'escm:GEN_FACTORY:factory_id_list_' + type;
    const cacheData = await ctx.helper.cache(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const whereMore = type === 1 ? ' AND FI.FTY_ID_FOR_GO IS NOT NULL' : '';
    const sql = "SELECT DISTINCT FACTORY_ID FROM ESCMOWNER.GEN_FACTORY FI WHERE ACTIVE = 'Y' AND INTERNAL_FLAG = 'Y' AND OU IS NOT NULL " + whereMore;
    // const res = await this.ctx.model2.query(sql);
    const res = await this.query('oracle', sql);
    const returnData = [];
    res.forEach(item => {
      returnData.push(item.FACTORY_ID);
    });
    if (typeof (exp) === 'number' && exp > -1) {
      await ctx.helper.cache(cacheKey, returnData, exp);
    }
    return returnData;

  }

  async getFactorysByFtyID(gmt_fty, exp = 60 * 60) {
    const { ctx } = this;
    const cacheKey = 'escm:GEN_FACTORY:fty_' + gmt_fty;
    const cacheData = await ctx.helper.cache(cacheKey);
    if (cacheData) {
      return cacheData;
    }

    // const Op = ctx.model2.Op;
    // const where = {
    //   ACTIVE: 'Y',
    //   INTERNAL_FLAG: 'Y',
    //   OU: {
    //     [Op.ne]: null,
    //   },
    //   FTY_ID_FOR_GO: {
    //     [Op.ne]: null,
    //   },
    //   FACTORY_ID: gmt_fty,
    // };
    // // let order = [['FACTORY_ID','DESC']]
    // const res = await ctx.model2.GenFactory.findOne({ where });
    // if (!res) {
    //   return false;
    // }
    // const resData = res.dataValues;

    const sql = `SELECT *  
      FROM ESCMOWNER.GEN_FACTORY FI  
      WHERE ACTIVE = 'Y' 
        AND INTERNAL_FLAG = 'Y' 
        AND OU IS NOT NULL 
        AND FI.FTY_ID_FOR_GO IS NOT NULL 
        AND FI.FACTORY_ID = '${gmt_fty}' `;
    const resData = await this.query('oracle', sql, 1);
    // let res = await this.ctx.model2.query(sql);
    // let resData = res[0][0];
    if (typeof (exp) === 'number' && exp > -1) {
      await ctx.helper.cache(cacheKey, resData, exp);
    }
    return resData;

  }

}

module.exports = GenFactoryService;
