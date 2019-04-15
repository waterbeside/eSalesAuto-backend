'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {


  async jsonReturn(code,data = {},msg = "") {
    const { ctx } = this;
    if(typeof(data)=="string"){
      msg = data;
      data = {};
    }
    let now = new Number(new Date().getTime()/1000).toFixed(0)
    ctx.body = {code,data,msg,date:now};
    return false;
    // process.exit(1);
  }

  async getUserData(){
    const { ctx , app} = this;
    if(typeof(app.myData)!='undefined' && typeof(app.myData.userBaseData)!='undefined' ){
      return app.myData.userBaseData;
    }else{
      return false;
    }
  }
  // async checkLogin() {
  //   const { ctx,app } = this;
  //   const jwt = app.jwt;
  //   let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE4MDAwMDIzMzIzMiwidWlkIjoyMiwibmFtZSI6InRlc3QiLCJpYXQiOjE1NTUxMjE2Mzd9.kQyXv1YQVlw1NQLNiEUh_NgSyJ8A-U9eJZYHdztbZPs';
  //   let decoded = jwt.verify(token, app.config.jwt.secret);
  //   app.userBaseData = decoded;
  //   await this.jsonReturn(-1,'你还未登入');
  //   return false;
  //   if (ctx.request.header['authorization']) {
  //     let token = ctx.request.header['authorization'].split(' ')[1];
  //     console.log(token)
  //     let decoded;
  //     //解码token
  //     try {
  //       decoded = jwt.verify(token, app.config.jwt.secret);
  //     } catch (error) {
  //       if (error.name == 'TokenExpiredError') {
  //
  //       }
  //     }
  //   }
  // }
}

module.exports = BaseController;
