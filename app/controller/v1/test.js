'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class TestController extends BaseController {
  async index() {
    const { ctx } = this;
    const test = await ctx.service.timmy.get();
    // console.log(test);
    ctx.body = test;

  }

  async show() {
    const { ctx } = this;
    // console.log(this.app.jwt);
    // const token = this.app.jwt.sign({ foo: 'bar' }, this.app.config.jwt.secret);
    // console.log(token);

    // ctx.body = await ctx.model.Test.findById(ctx.params.id);
    var data = await ctx.service.sppoTitle.find(parseInt(ctx.params.id));
    return ctx.jsonReturn(0,data,'Successful');
    // return ctx.jsonReturn(0,'Successful');
  }

}



module.exports = TestController;
