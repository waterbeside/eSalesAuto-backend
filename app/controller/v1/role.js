'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');

class RoleController extends BaseController {


  /**
   * role selete options list
   */
  async selects() {
    const { ctx } = this;
    const list = await ctx.service.role.getSelects();
    return ctx.jsonReturn(0, { list }, 'Successfully');
  }

}

module.exports = RoleController;
