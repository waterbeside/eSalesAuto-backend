'use strict';

const BaseService = require('./Base');
class GenWashTypeService extends BaseService {
  async checkExistByWashType(washType='') {
    if(!washType){
      return 0;
    }
    let sql = "SELECT COUNT(*) as c FROM  escmowner.GEN_WASH_TYPE WHERE WASH_TYPE_DESC = '"+washType+"'";
    let res = await this.ctx.model2.query(sql);
    console.log(res[0][0].c);
    return res[0][0].c;

  }
}

module.exports = GenWashTypeService;
