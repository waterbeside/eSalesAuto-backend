'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class PassportController extends BaseController {

  /**
   * 登入 POST
   */
  async login() {
    const { ctx, service } = this;
    const username = ctx.request.body.username;
    const password = ctx.request.body.password;
    let errorMsg = '';
    let res = await service.user.checkLoginByPassword(username, password);

    if (!res) {
      let errorCode = service.user.errorCode ? service.user.errorCode : -1;
      if (errorCode === 10002) {
        /**
         * TODO:如果A库不存在用户，查库B的用户并写入库A
         */
        const userData = await ctx.service.user.syncUser(username, password, false);
        if (!userData) {
          errorCode = service.user.errorCode !== 0 ? service.user.errorCode : -1;
          switch (service.user.errorCode) {
            case 10002:
              errorMsg = '用户不存在';
              break;
            case -1:
              errorMsg = '登入失败';
              break;
            default:
              errorCode = 10001;
              errorMsg = '用户名或密码错误';
              break;
          }
          return ctx.jsonReturn(errorCode, errorMsg);
        }
        res = {
          username: userData.username,
          roles: userData.roles,
          uid: userData.id,
          token: service.user.createJwt(userData, 3600 * 24 * 2),
        };
      } else {
        errorMsg = service.user.errorMsg ? service.user.errorMsg : '登入失败';
        return ctx.jsonReturn(errorCode, errorMsg);
      }
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

}

module.exports = PassportController;
