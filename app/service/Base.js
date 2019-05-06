'use strict';

const Service = require('egg').Service;
class BaseService extends Service {

  formatOracleRes(res){
    let metaData = res.metaData;
    let rows = res.rows;
    let list = [];

    rows.forEach((item,index) => {
      let item_kv = {};
      metaData.forEach((field,i) => {
        // console.log(field.name)
        
        item_kv[field.name] = item[i];
      });
      list[index] = item_kv;
    });

    return list;
  }
  
  
}

module.exports = BaseService;
