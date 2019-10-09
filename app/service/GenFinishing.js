'use strict';

const BaseService = require('./Base');
class GenFinishingService extends BaseService {

  /**
   * 通过 FINISHING_CD 查数据
   * @param {String} FINISHING_CD FINISHING_CD
   * @param {Integer} exp  缓存有效期
   */
  async findByFC(FINISHING_CD, exp = 60 * 3) {
    if (!FINISHING_CD) {
      return false;
    }
    const cacheKey = 'orl:gen_finishing:FC_' + FINISHING_CD;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    let sql = 'select * from ESCMOWNER.GEN_FINISHING ';
    sql += " where FINISHING_CD = '" + FINISHING_CD + "'";
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = GenFinishingService;
