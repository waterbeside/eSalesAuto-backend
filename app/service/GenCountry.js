'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenCountryService extends BaseService {

  async getCountryByName(name, exp = 60 * 60) {
    const { ctx } = this;
    const cacheKey = 'escm:GEN_COUNTRY:name_' + name;
    const cacheData = await ctx.helper.cache(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    // const Op = ctx.model2.Op;
    // const fn = ctx.model2.fn;

    // const where = {
    //   // ACTIVE:'Y',
    //   $and: [
    //     ctx.model2.where(fn('UPPER', ctx.model2.col('NAME')), '=', name),
    //     ctx.model2.where(ctx.model2.col('ACTIVE'), '=', 'Y'),
    //   ],
    // };
    // // let order = [['FACTORY_ID','DESC']]
    // const res = await ctx.model2.GenCountry.findOne({
    //   where,
    //   order: [
    //     [ 'COUNTRY_CD', 'ASC' ],
    //   ],
    // });
    // if (!res) {
    //   return false;
    // }
    // const resData = res.dataValues;
    name = name.toLowerCase();
    const sql = `SELECT *  FROM ESCMOWNER.GEN_COUNTRY FI  
      WHERE ACTIVE = 'Y' AND lower(FI.NAME) = '${name}' `;
    const resData = await this.query('oracle', sql, 1);
    // let res = await this.ctx.model2.query(sql);
    // let resData = res[0][0];
    if (typeof (exp) === 'number' && exp > -1) {
      await ctx.helper.cache(cacheKey, resData, exp);
    }
    return resData;

  }

}

module.exports = GenCountryService;
