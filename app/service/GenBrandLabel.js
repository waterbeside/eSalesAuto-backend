'use strict';

// const mssql = require('mssql');
const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenBrandLabelService extends BaseService {

  async getBrandCDByCustomerCode(customer_code, exp = 60 * 20) {
    // console.log(this.app.oracle);

    // const connection = await this.app.oracle.getConnection();
    // customer_code = parseInt(customer_code);
    // const res = await connection.execute("SELECT DISTINCT CUSTOMER_CD, BRAND_CD FROM GEN_BRAND_LABEL WHERE  CUSTOMER_CD = '"+customer_code+"' AND ACTIVE='Y' ORDER BY BRAND_CD ASC");
    // connection.close();
    // console.log(this.formatOracleRes(res))
    // return this.formatOracleRes(res);

    const cacheKey = 'm2:gen_brand_label:brand_cd:ccd_' + customer_code;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = "SELECT DISTINCT CUSTOMER_CD, BRAND_CD FROM [escmowner].[GEN_BRAND_LABEL] WHERE CUSTOMER_CD = '" + customer_code + "'  AND ACTIVE='Y' ORDER BY BRAND_CD ASC";
    const queryRes = await this.ctx.model2.query(sql);
    const res = queryRes[0];
    if (res && typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }

  async findAllByCcdAndBcd(customer_cd, brand_cd, exp = 60 * 20) {
    const cacheKey = 'm2:gen_brand_label:ccd_' + customer_cd + '_bcd_' + brand_cd;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const map = " CUSTOMER_CD = '" + customer_cd + "' AND BRAND_CD = '" + brand_cd + "' AND ACTIVE='Y' ";
    const sql = 'SELECT CUSTOMER_CD, BRAND_CD, LABEL_CD, LABEL_DESC FROM [escmowner].[GEN_BRAND_LABEL] WHERE ' + map + "  AND ACTIVE='Y' ORDER BY BRAND_CD ASC";
    const queryRes = await this.ctx.model2.query(sql);
    const res = queryRes[0];
    if (res && typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = GenBrandLabelService;
