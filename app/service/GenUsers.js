'use strict';

/**
 * Data from DB2
 */
const BaseService = require('./Base');
class GenUsersService extends BaseService {

  /**
   * 通过用户名查找DEPARTMENT_ID
   * @param {String} username 用户名
   */
  async getDepartmentIdByUsername(username) {
    if (!username) {
      return false;
    }
    const sql = "SELECT USER_ID, DEPARTMENT_ID FROM escmowner.GEN_USERS WHERE USER_ID = '" + username + "'";
    const res = await this.ctx.model2.query(sql);
    return res[0][0];
  }

  /**
   * 通过用户名查找用户数据
   * @param {String} username 用户名
   * @param {Boolean} getActive 是否只取在职
   * @param {String} field 要查的字段，默认全部
   */
  async getDataByUsername(username, getActive = false, field = '*') {
    let where = "USER_ID = '" + username + "'";
    if (getActive) {
      where += " AND ACTIVE = 'Y'";
    }
    const sql = 'SELECT ' + field + ' FROM escmowner.GEN_USERS WHERE ' + where + ' ORDER BY USER_ID OFFSET 0 ROWS FETCH NEXT 1 ROWS ONLY';
    return await this.query('model2', sql);
  }
}

module.exports = GenUsersService;
