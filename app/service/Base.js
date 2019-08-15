'use strict';

const Service = require('egg').Service;
class BaseService extends Service {

  errorCode = 0;
  errorMsg = '';
  data = null;

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


  async query(model, sql) {
    try {
      if ([ 'model', 'model2' ].includes(model)) {
        const res = await this.ctx[model].query(sql);
        return res[0][0];
      }
      if (model === 'oracle') {
        const connection = await this.app.oracle.getConnection();
        let res = await connection.execute(sql);
        await connection.close();
        res = this.formatOracleRes(res);
        return res;
      }
    } catch (err) {
      console.log(err.message);
    }
    return false;

  }
}

module.exports = BaseService;
