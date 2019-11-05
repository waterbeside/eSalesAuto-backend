'use strict';

const BaseService = require('./Base');
class GenWashTypeService extends BaseService {
  async checkExistByWashType(washType = '') {
    if (!washType) {
      return 0;
    }
    const sql = "SELECT COUNT(*) as c FROM  ESCMOWNER.GEN_WASH_TYPE WHERE WASH_TYPE_DESC = '" + washType + "'";
    const res = await this.query('oracle', sql, 1);
    return res.c;
  }

  async washTypeList() {
    const { ctx } = this;
    const cacheKey = 'escm:gen_wash_type:wash_type_desc_list';
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const sql = 'SELECT DISTINCT WASH_TYPE_DESC FROM  ESCMOWNER.GEN_WASH_TYPE ORDER BY WASH_TYPE_DESC';
    const res = await this.query('oracle', sql);
    const returnData = [];
    res.forEach(item => {
      returnData.push(item.WASH_TYPE_DESC);
    });
    await ctx.helper.setStoreData(cacheKey, returnData, 60 * 60 * 12);
    return returnData;
  }

  /**
   * 通过 wash_type_desc 查数据
   * @param {String} WASH_TYPE_DESC WASH_TYPE_DESC
   * @param {*} exp 缓存的有效期
   */
  async findByDesc(WASH_TYPE_DESC, exp = 60 * 3) {
    const cacheKey = 'escm:GEN_WASH_TYPE:washTypeDesc_' + WASH_TYPE_DESC;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const where = `WASH_TYPE_DESC = '${WASH_TYPE_DESC}' AND ACTIVE = 'Y' `;
    const sql = `SELECT * FROM  ESCMOWNER.GEN_WASH_TYPE WHERE ${where} ORDER BY WASH_TYPE_CD`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;

  }
}

module.exports = GenWashTypeService;
