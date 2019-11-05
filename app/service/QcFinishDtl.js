'use strict';

const BaseService = require('./Base');
class QcFinishDtlService extends BaseService {


  async findByQc(QUALITY_CODE, exp = 60 * 3) {
    if (!QUALITY_CODE) {
      return false;
    }
    const cacheKey = 'escm:QCFINISHDTL:QC_' + QUALITY_CODE;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select  q.* from ESCMOWNER.QCFINISHDTL q where QUALITY_CODE = '${QUALITY_CODE}'`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }
}

module.exports = QcFinishDtlService;
