'use strict';

const BaseService = require('./Base');
class QcFinishDtlService extends BaseService {


  /**
   * 通过 DESCRIPTION 查找数据
   * @param {String} DESCRIPTION DESCRIPTION
   * @param {Number} exp 缓存有效期
   */
  async findByDesc(DESCRIPTION, exp = 60 * 3) {
    if (!DESCRIPTION) {
      return false;
    }
    const descMd5 = this.ctx.helper.md5(DESCRIPTION);
    const cacheKey = 'escm:PBKNITCONSTRUCTION:DESC_' + descMd5;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select * from ESCMOWNER.PBKNITCONSTRUCTION where DESCRIPTION = '${DESCRIPTION}' ORDER BY IS_ACTIVE DESC`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = QcFinishDtlService;
