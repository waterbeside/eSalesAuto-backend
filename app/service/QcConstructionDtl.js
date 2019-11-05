'use strict';

const BaseService = require('./Base');

class QcConstructionDtlService extends BaseService {
  /**
   * 通过QUALITY_CODE查数据
   * @param {string} QUALITY_CODE QUALITY_CODE
   * @param {number} exp 缓存时间
   */
  async findByQc(QUALITY_CODE, exp = 60) {
    if (!QUALITY_CODE) {
      return false;
    }
    const cacheKey = `escm:QCCONSTRUCTIONDTL:QC_${QUALITY_CODE}`;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select  q.* from ESCMOWNER.QCCONSTRUCTIONDTL q where QUALITY_CODE = '${QUALITY_CODE}'`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;

  }
}

module.exports = QcConstructionDtlService;
