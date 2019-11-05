'use strict';

const BaseService = require('./Base');
class FabLabdipLibService extends BaseService {


  /**
   * 通过id查数据
   * @param {nubmer} id id
   * @param {number} exp 缓存时间
   */
  async findById(id, exp = 60) {
    if (!id) {
      return false;
    }
    const cacheKey = `escm:FAB_LABDIP_LAB:ID_${id}`;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await this.ctx.helper.cache(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const sql = `SELECT * FROM ESCMOWNER.FAB_LABDIP_LAB WHERE LABDIP_LIBRARY_ID = ${id}`;
    const res = await this.query('oracle', sql, 1);
    if (typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res;
  }

}

module.exports = FabLabdipLibService;
