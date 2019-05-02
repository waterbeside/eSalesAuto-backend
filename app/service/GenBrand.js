'use strict';

const BaseService = require('./Base');
// const Service = require('egg').Service;
class GennBrandService extends BaseService {
  async findAllByCustomerCode(customer_code,fields='*') {
    // console.log(this.app.oracle);
    const connection = await this.app.oracle.getConnection();
    console.log("SELECT "+fields+" FROM GEN_BRAND WHERE  CUSTOMER_CD = '"+customer_code+"' ORDER BY BRAND_CD ASC");
    customer_code = parseInt(customer_code);
    const res = await connection.execute("SELECT "+fields+" FROM GEN_BRAND WHERE  CUSTOMER_CD = '"+customer_code+"' ORDER BY BRAND_CD ASC");
    connection.close();
    console.log(this.formatOracleRes(res))
    return this.formatOracleRes(res);
  }

  async findBandByCustomerCode(customer_code) {
    // console.log(typeof(this.ctx.model.SppoTitle.findById));
    const res = await this.findAllByCustomerCode(customer_code);
    let returnData = [];
    res.forEach(element => {
      returnData.push(element.BRAND_CD)
    });
    return returnData;
  }
}

module.exports = GennBrandService;
