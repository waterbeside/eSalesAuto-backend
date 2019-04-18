'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class PassportController extends BaseController {
  async index() {
    const { ctx, app } = this;
  
    var userData = await this.getUserData(1);
    if(!userData){
      return this.jsonReturn(10004,'Failed');
    }
    var returnData =  {
      "username" : userData.username,
      "uid" : userData.id,
      "rid" : userData.rid,
      "roles" : userData.rid == 1 ? ['admin'] : [],
    }
    return this.jsonReturn(0,returnData,'Successful');

  }

  async login() {
    const { ctx } = this;
    var username = ctx.request.body.username;
    var password = ctx.request.body.password;
    const res = await ctx.model.User.checkLoginByPassword(username,password);
    if(!res){
      var errorCode  = ctx.model.User.errorCode ? ctx.model.User.errorCode : -1;
      var errorMsg  = ctx.model.User.errorMsg ? ctx.model.User.errorMsg : '登入失败';
      return this.jsonReturn(errorCode,errorMsg);
    }
    return this.jsonReturn(0,res,'Successful');


  }


}



module.exports = PassportController;
