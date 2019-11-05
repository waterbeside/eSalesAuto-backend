'use strict';

const BaseService = require('./Base');
class PbKnitFinishService extends BaseService {


  async findByName(FINISHING_NAME, exp = 60) {
    if (!FINISHING_NAME) {
      return false;
    }
    const cacheKey = 'escm:PBKNITFINISH:Name_' + FINISHING_NAME;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select  q.* from ESCMOWNER.PBKNITFINISH q where FINISHING_NAME = '${FINISHING_NAME}' and IS_ACTIVE = 'Y' `;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = PbKnitFinishService;
