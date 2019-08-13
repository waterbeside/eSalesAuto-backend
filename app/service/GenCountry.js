'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenCountryService extends BaseService {

  async getCountryByName(name) {
    const { ctx, app } = this;
    const cacheKey = 'escm:genCountry:name_' + name;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const Op = ctx.model2.Op;
    const fn = ctx.model2.fn;

    const where = {
      // ACTIVE:'Y',
      $and: [
        ctx.model2.where(fn('UPPER', ctx.model2.col('NAME')), '=', name),
        ctx.model2.where(ctx.model2.col('ACTIVE'), '=', 'Y'),
      ],
    };


    // let order = [['FACTORY_ID','DESC']]
    const res = await ctx.model2.GenCountry.findOne({
      where,
      order: [
        [ 'COUNTRY_CD', 'ASC' ],
      ],
    });
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

module.exports = GenCountryService;
