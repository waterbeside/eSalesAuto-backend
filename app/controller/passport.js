'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('./Base');
class PassportController extends BaseController {
  async index() {
    const { ctx, app } = this;
    // console.log(ctx.request.params);
    const token = this.app.jwt.sign({ exp:180000233232,uid:22,name:'test' }, this.app.config.jwt.secret);
    // var checkRes =await this.checkLogin();
    // if(!checkRes){
    //   return this.jsonReturn(0,{token},'Successful');
    // }

    var userData = await this.getUserData();
    console.log(userData);
    return this.jsonReturn(0,{token},'Successful');
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
