const jwt = require('jsonwebtoken') //引入jsonwebtoken

module.exports = () => {
  return async function (ctx, next) {
    ctx.app.myData = {};
    ctx.app.myData.userBaseData = {a:1};

    await next();
    return false;

    const config =  ctx.app.config;
    const jwt = ctx.app.jwt;
    // let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDAwMDIzMzIzMiwidWlkIjoyMiwibmFtZSI6InRlc3QiLCJpYXQiOjE1NTUxMjE2Mzd9.kQyXv1YQVlw1NQLNiEUh_NgSyJ8A-U9eJZYHdztbZPs';
    // let decoded = jwt.verify(token, config.jwt.secret);
    // console.log(decoded);
    // ctx.app.myData = {};
    // ctx.app.myData.userBaseData = 'aaa';
    // await next();
    // return;

    // ctx.body = {code:10005,msg:'登入令牌过期，请重新登入'};
    // return ;
    jsonReturn = (code,data = {},msg = "")=>{
      if(typeof(data)=="string"){
        msg = data;
        data = {};
      }
      let now = new Number(new Date().getTime()/1000).toFixed(0)
      ctx.body = {code,data,msg,date:now};
      return;
    }

    if (ctx.request.header['authorization']) {
      let token = ctx.request.header['authorization'].split(' ')[1];
      console.log(token)
      let decoded;
      //解码token
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        if (error.name == 'TokenExpiredError') {
          jsonReturn(10005,'登入令牌过期，请重新登入');
          // ctx.body = {code:10005,msg:'登入令牌过期，请重新登入'};
        }else{
          jsonReturn(10004,'你尚未登入，请登入');
          // ctx.body = {code:10004,msg:'你尚未登入，请登入'};

        }
      }
      ctx.app.myData = {};
      ctx.app.myData.userBaseData = decoded;
      await next();
    }else{
      jsonReturn(10004,'你尚未登入，请登入');
      // ctx.body = {code:10004,msg:'你尚未登入，请登入'};
      return;

    }

  }
};
