'use strict';

const Service = require('egg').Service;
class BaseService extends Service {

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
}

module.exports = BaseService;
