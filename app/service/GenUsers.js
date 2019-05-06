'use strict';
const BaseService = require('./Base');
class GenUsersService extends BaseService {
  async getDepartmentIdByUsername(username) {
    if(!username){
      return false;
    }
    let sql = "SELECT USER_ID, DEPARTMENT_ID FROM escmowner.GEN_USERS WHERE USER_ID = '"+username+"'";
    let res = await this.ctx.model2.query(sql);
    return res[0][0];
  }
}

module.exports = GenUsersService;
