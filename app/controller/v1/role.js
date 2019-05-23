'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class RoleController extends BaseController {


  /**
   * role selete options list
   */
  async selects() {
    const {ctx, app} = this;
    let list = await ctx.service.role.getSelects();
    return ctx.jsonReturn(0,{list},'Successfully');
  }

}

module.exports = RoleController;
