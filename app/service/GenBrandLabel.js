'use strict';

// const mssql = require('mssql');
const BaseService = require('./Base');
// const Service = require('egg').Service;
class GenBrandLabelService extends BaseService {
  async getBrandCDByCustomerCode(customer_code) {
    // console.log(this.app.oracle);

    // const connection = await this.app.oracle.getConnection();
    // customer_code = parseInt(customer_code);
    // const res = await connection.execute("SELECT DISTINCT CUSTOMER_CD, BRAND_CD FROM GEN_BRAND_LABEL WHERE  CUSTOMER_CD = '"+customer_code+"' AND ACTIVE='Y' ORDER BY BRAND_CD ASC");
    // connection.close();
    // console.log(this.formatOracleRes(res))
    // return this.formatOracleRes(res);

    const sql = "SELECT DISTINCT CUSTOMER_CD, BRAND_CD FROM [escmowner].[GEN_BRAND_LABEL] WHERE CUSTOMER_CD = '" + customer_code + "'  AND ACTIVE='Y' ORDER BY BRAND_CD ASC";
    const res = await this.ctx.model2.query(sql);
    return res[0];


  }

  async findBandByCustomerCode(customer_code) {
    // console.log(typeof(this.ctx.model.SppoTitle.findById));
    const res = await this.findAllByCustomerCode(customer_code);
    const returnData = [];
    res.forEach(element => {
      returnData.push(element.BRAND_CD);
    });
    return returnData;
  }
}

module.exports = GenBrandLabelService;
