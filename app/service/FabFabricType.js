'use strict';

const BaseService = require('./Base');
class FabFabricTypeService extends BaseService {
  async checkExistByFabricTypeCode(typeCode = '') {
    if (!typeCode) {
      return 0;
    }
    const sql = "SELECT COUNT(*) as c FROM ESCMOWNER.FAB_FABRIC_TYPE WHERE FOR_KNIT_FLAG = 'Y' AND FABRIC_TYPE_CD = '" + typeCode + "'";
    const res = await this.query('oracle', sql, 1);
    // const res = await this.ctx.model2.query(sql);
    // console.log(res[0][0].c);
    return res.c;
  }
}

module.exports = FabFabricTypeService;
