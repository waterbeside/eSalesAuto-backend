'use strict';

const BaseService = require('./Base');
class GenWashTypeService extends BaseService {
  async checkExistByWashType(washType = '') {
    if (!washType) {
      return 0;
    }
    const sql = "SELECT COUNT(*) as c FROM  escmowner.GEN_WASH_TYPE WHERE WASH_TYPE_DESC = '" + washType + "'";
    const res = await this.ctx.model2.query(sql);
    return res[0][0].c;
  }

  async washTypeList() {
    const { ctx } = this;
    const cacheKey = 'escm:gen_wash_type:wash_type_desc_list';
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const sql = 'SELECT DISTINCT WASH_TYPE_DESC FROM  escmowner.GEN_WASH_TYPE ORDER BY WASH_TYPE_DESC';
    const res = await this.ctx.model2.query(sql);
    const returnData = [];
    res[0].forEach(item => {
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
  async findByDesc(WASH_TYPE_DESC, exp = 60 * 10) {
    const cacheKey = 'm2:gen_wash_type:washTypeDesc_' + WASH_TYPE_DESC;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    let where = "WASH_TYPE_DESC = '" + WASH_TYPE_DESC + "'";
    where += " AND ACTIVE = 'Y'";
    const sql = 'SELECT * FROM  escmowner.GEN_WASH_TYPE WHERE ' + where + ' ORDER BY WASH_TYPE_CD';
    const res = await this.query('model2', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;

  }
}

module.exports = GenWashTypeService;
