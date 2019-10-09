'use strict';

const BaseService = require('./Base');
class FabComboService extends BaseService {


  async findByCcdAndCombo(CUSTOMER_CD, COMBO_NAME, exp = 60 * 3) {
    if (!CUSTOMER_CD || !COMBO_NAME) {
      return false;
    }
    const cacheKey = 'm2:FAB_COMBO:CCD_' + CUSTOMER_CD + '_CN_' + COMBO_NAME;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    let sql = 'SELECT * FROM ESCMOWNER.FAB_COMBO ';
    sql += " WHERE CUSTOMER_CD = '" + CUSTOMER_CD + "' AND COMBO_NAME = '" + COMBO_NAME + "'";
    sql += 'ORDER BY CREATE_DATE DESC';
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = FabComboService;
