'use strict';

const BaseService = require('./Base');
class QcMainInfoService extends BaseService {
  async findByQcRefPpo(QC_REF_PPO, exp = 1800) {
    if (!QC_REF_PPO) {
      return false;
    }
    const cacheKey = 'm2:QCMAININFO:QcRefPpO_' + QC_REF_PPO;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = "select * from escmowner.QCMAININFO where QC_REF_PPO = '" + QC_REF_PPO + "'";
    const res = await this.query('model2', sql, 1);
    return res;
  }
}

module.exports = QcMainInfoService;
