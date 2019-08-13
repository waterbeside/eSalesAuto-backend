'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {

  /**
   * 取得用户信息
   * @param {integer} type 类型 0:只返回jwt存的信息，1:从数据库查询用户信息。
   */
  async getUserData(type = 0) {
    const { ctx, app } = this;
    if (typeof (app.myData) === 'undefined') {
      return false;
    }
    if (typeof (app.myData.jwt_decoded) === 'undefined') {
      return false;
    }
    app.myData.userBaseData = {
      uid: app.myData.jwt_decoded.uid,
      username: app.myData.jwt_decoded.username,
    };
    if (type) {
      const uid = app.myData.jwt_decoded.uid;
      const res = await ctx.model.User.findByUid(uid);

      if (res) {
        res.roles = res.roles ? res.roles.split(',') : [];
        res.uid = res.id;
        return res;
      }
    } else {
      if (typeof (app.myData.userBaseData) !== 'undefined') {
        return app.myData.userBaseData;
      }
    }
    return false;
  }

  /**
   * 返回分页页码数据
   * @param {Object} {总数,页码,每页数 }
   */
  pagination({ total, page, pagesize }) {
    total = parseInt(total);
    page = parseInt(page) ? parseInt(page) : 1;
    const offset = (page - 1) * pagesize;
    const pagecount = Math.ceil(total / pagesize);
    return {
      total,
      page,
      pagesize,
      offset,
      pagecount,
    };
  }


}

module.exports = BaseController;
