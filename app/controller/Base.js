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

  /**
   * 取得用户信息
   */
  async getUserData(type = 0){
    const { ctx , app} = this;
    if(typeof(app.myData)=='undefined'){
      return false;
    }
    if(typeof(app.myData.jwt_decoded)=='undefined'){
      return false;
    }
    app.myData.userBaseData = {
      "uid" : app.myData.jwt_decoded.uid,
      "username" : app.myData.jwt_decoded.username,
    }
    if(type){
      let uid = app.myData.jwt_decoded.uid;
      let res = await ctx.model.User.findByUid(uid);
      if(res){
        return {
          "id":res.id,
          "username":res.username,
          "rid":res.rid,
        }
      }
    }else{
      if(typeof(app.myData.userBaseData)!='undefined' ){
        return app.myData.userBaseData;
      }
    }
    return false;
    
  }

}

module.exports = BaseController;
