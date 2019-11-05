'use strict';

const BaseService = require('./Base');
class QcMainInfoService extends BaseService {
  async findByQcRefPpo(QC_REF_PPO, exp = 60) {
    if (!QC_REF_PPO) {
      return false;
    }
    const cacheKey = 'escm:QCMAININFO:QcRefPpO_' + QC_REF_PPO;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = "select * from ESCMOWNER.QCMAININFO where QC_REF_PPO = '" + QC_REF_PPO + "'";
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }

  /**
   * 通过QUALITY_CODE查数据
   * @param {string} QUALITY_CODE QUALITY_CODE
   * @param {number} exp 缓存时间
   */
  async findByQc(QUALITY_CODE, exp = 60) {
    if (!QUALITY_CODE) {
      return false;
    }
    const cacheKey = 'escm:QCMAININFO:QC_' + QUALITY_CODE;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `select  q.* from ESCMOWNER.QCMAININFO q where QUALITY_CODE = '${QUALITY_CODE}'`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;

  }
}

module.exports = QcMainInfoService;
