'use strict';

const BaseService = require('./Base');
class FabYarnTypeService extends BaseService {


  async findByDesc(YARN_TYPE_DESC, exp = 60 * 3) {
    if (!YARN_TYPE_DESC) {
      return false;
    }
    const cacheKey = 'escm:FAB_TARN_TYPE:DESC_' + YARN_TYPE_DESC;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    let sql = 'select * from ESCMOWNER.FAB_TARN_TYPE ';
    sql += " where YARN_TYPE_DESC = '" + YARN_TYPE_DESC + "'";
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = FabYarnTypeService;
