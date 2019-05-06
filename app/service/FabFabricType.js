'use strict';

const BaseService = require('./Base');
class FabFabricTypeService extends BaseService {
  async checkExistByFabricTypeCode(typeCode='') {
    if(!typeCode){
      return 0;
    }
    let sql = "SELECT COUNT(*) as c FROM escmowner.FAB_FABRIC_TYPE WHERE FOR_KNIT_FLAG = 'Y' AND FABRIC_TYPE_CD = '"+typeCode+"'";
    let res = await this.ctx.model2.query(sql);
    console.log(res[0][0].c);
    return res[0][0].c;
  }
}

module.exports = FabFabricTypeService;
