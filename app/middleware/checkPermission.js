const jwt = require('jsonwebtoken') //引入jsonwebtoken
const _ = require('lodash');

module.exports = (options) => {
  return async function (ctx, next) {

    let roles = [];
    if(_.isArray(options)){
      roles = options;
    }else if(_.isObject(options) && _.isArray(options.roles)){
      roles = options.roles;
    }


    /**** 检查登入状态(JWT) ****/
    const config =  ctx.app.config;
    const jwt = ctx.app.jwt;
    if (ctx.request.header['authorization']) {
      let token = ctx.request.header['authorization'].split(' ')[1];
      // console.log(token)
      let decoded;
      //解码token
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        if (error.name == 'TokenExpiredError') {
          return ctx.jsonReturn(10005,'登入令牌过期，请重新登入');
        }else{
          return ctx.jsonReturn(10004,'你尚未登入，请登入');
        }
      }
      ctx.app.myData = {};
      ctx.app.myData.jwt_decoded = decoded;

      /**** 验证角色路由权限 ****/
      let jwtRoles = decoded.roles;
      let roles_x = _.intersection(jwtRoles,roles);
   
      if(!jwtRoles.includes('admin') && roles.length > 0 && roles_x.length < 1){
        return ctx.jsonReturn(10001,'无权操作');
      }

      await next();
    }else{
      return ctx.jsonReturn(10004,'你尚未登入，请登入');
      // ctx.body = {code:10004,msg:'你尚未登入，请登入'};

    }

  }
};
