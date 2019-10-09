'use strict';

const Service = require('egg').Service;
class BaseService extends Service {

  setError(errorCode, errorMsg = '', data = null) {
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
    this.data = data;
  }

  getError() {
    const errorCode = this.errorCode || 0;
    const errorMsg = this.errorMsg || '';
    const data = this.data || null;
    return { errorCode, errorMsg, data };
  }


  formatOracleRes(res) {
    const metaData = res.metaData;
    const rows = res.rows;
    const list = [];

    rows.forEach((item, index) => {
      const item_kv = {};
      metaData.forEach((field, i) => {
        // console.log(field.name)

        item_kv[field.name] = item[i];
      });
      list[index] = item_kv;
    });

    return list;
  }


  async query(model, sql, isFind = 0) {
    try {
      if ([ 'model', 'model2' ].includes(model)) {
        const res = await this.ctx[model].query(sql);
        return isFind === 1 ? res[0][0] : res[0];
      }
      if (model === 'oracle') {
        const connection = await this.app.oracle.getConnection();
        const res = await connection.execute(sql);
        await connection.close();
        return isFind === 1 ? this.formatOracleRes(res)[0] : this.formatOracleRes(res);
      }
      return false;
    } catch (err) {
      console.log(err.message);
    }
    return false;

  }
}

module.exports = BaseService;
