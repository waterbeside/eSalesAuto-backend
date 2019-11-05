'use strict';

const BaseService = require('./Base');
class PbKnitYarnTypeService extends BaseService {


  async findByDesc(desc, exp = 60) {
    if (!desc) {
      return false;
    }
    const cacheKey = 'escm:PBKNITYARNTYPE:DESC_' + this.ctx.helper.md5(desc);
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select * from ESCMOWNER.PBKNITYARNTYPE where DESCRIPTION = '${desc}' and IS_ACTIVE = 'Y' `;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = PbKnitYarnTypeService;
