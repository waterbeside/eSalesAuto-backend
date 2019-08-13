'use strict';
const moment = require('moment');

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class PassportController extends BaseController {
  async index() {
    const { ctx } = this;

    const userData = await this.getUserData(1);
    if (!userData) {
      return ctx.jsonReturn(10004, 'Failed');
    }
    const username = userData.username;
    const customer_code = await ctx.model.MasterGenUser.findCustomCodeByUserID(username);
    const returnData = {
      username: userData.username,
      uid: userData.id,
      roles: userData.roles,
      sales_team: userData.sales_team,
      customer_code,
      full_name: userData.FullName,
      last_login_time: moment(userData.last_login_time).valueOf(),
    };
    console.log(returnData);

    return ctx.jsonReturn(0, returnData, 'Successful');

  }

  /**
   * 登入 POST
   */
  async login() {
    const { ctx } = this;
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    const res = await ctx.model.User.checkLoginByPassword(username, password);
    if (!res) {
      const errorCode = ctx.model.User.errorCode ? ctx.model.User.errorCode : -1;
      const errorMsg = ctx.model.User.errorMsg ? ctx.model.User.errorMsg : '登入失败';
      return ctx.jsonReturn(errorCode, errorMsg);
    }
    await ctx.model.User.update({
      last_login_time: new Date(),
    }, {
      where: {
        id: res.uid,
      },
    });
    return ctx.jsonReturn(0, res, 'Successful');

  }

  /**
   * 登出 DELETE
   */
  async logout() {
    const {
      ctx,
    } = this;

    return ctx.jsonReturn(0, 'Successful');
  }

  /**
   * 取得用户的客户码 GET
   */
  async customer_code() {
    const {
      ctx,
    } = this;
    const userData = await this.getUserData();
    const username = userData.username;
    const res = await ctx.model.MasterGenUser.findByUserID(username);
    if (!res) {
      return ctx.jsonReturn(20002, [], 'No Data');
    }
    return ctx.jsonReturn(0, res, 'Successful');
  }


  async change_pass() {
    const {
      ctx,
    } = this;
    const userData = await this.getUserData();
    const id = userData.uid;
    const pass = ctx.request.body.pass;
    const passRes = ctx.model.User.createPassword(pass);
    const upData = {
      password: passRes.password,
      salt: passRes.salt,
    };

    const res = await ctx.model.User.update(upData, {
      where: {
        id,
      },
    });
    if (res && res[0] > 0) {
      return ctx.jsonReturn(0, 'Successfully');
    }
    return ctx.jsonReturn(-1, null, '提交失败，请稍候再试');
  }

}

module.exports = PassportController;
