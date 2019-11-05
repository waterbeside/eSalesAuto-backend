'use strict';

const BaseService = require('./Base');
class FabComboLabService extends BaseService {


  async findByFabComboId(FAB_COMBO_ID, exp = 60) {
    if (!FAB_COMBO_ID) {
      return false;
    }
    const cacheKey = 'escm:FAB_COMBO_LABDIP:FCID' + FAB_COMBO_ID;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `SELECT * FROM ESCMOWNER.FAB_COMBO_LABDIP WHERE FAB_COMBO_ID = ${FAB_COMBO_ID} ORDER BY CREATE_DATE DESC`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }

}

module.exports = FabComboLabService;
