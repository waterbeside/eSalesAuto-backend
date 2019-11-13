'use strict';

const _ = require('lodash');
const Controller = require('egg').Controller;

class BaseController extends Controller {

  get modelName() {
    return '';
  }

  get modelPK() {
    return this.ctx.model[this.modelName].primaryKeyField;
  }
  /**
   * 取得用户信息
   * @param {integer} type 类型 0:只返回jwt存的信息，1:从数据库查询用户信息。
   */
  async getUserData(type = 0) {
    const { ctx, app } = this;
    if (typeof (app.myData) === 'undefined') {
      return false;
    }
    if (typeof (app.myData.jwt_decoded) === 'undefined') {
      return false;
    }
    app.myData.userBaseData = {
      uid: app.myData.jwt_decoded.uid,
      username: app.myData.jwt_decoded.username,
    };
    if (type) {
      const uid = app.myData.jwt_decoded.uid;
      const res = await ctx.model.User.findByUid(uid);

      if (res) {
        res.roles = res.roles ? res.roles.split(',') : [];
        res.uid = res.id;
        return res;
      }
    } else {
      if (typeof (app.myData.userBaseData) !== 'undefined') {
        return app.myData.userBaseData;
      }
    }
    return false;
  }

  /**
   * 返回分页页码数据
   * @param {Object} {总数,页码,每页数 }
   */
  pagination({ total, page, pagesize }) {
    total = parseInt(total);
    page = parseInt(page) ? parseInt(page) : 1;
    const offset = (page - 1) * pagesize;
    const pagecount = Math.ceil(total / pagesize);
    return {
      total,
      page,
      pagesize,
      offset,
      pagecount,
    };
  }


  async pageList(findOption, option) {
    let model = null;
    if (_.isString(option.model)) {
      model = this.ctx.model[option.model];
    } else if (_.isObject(option.model)) {
      model = option.model;
    } else {
      return false;
    }
    const page = option.page ? option.page : 1;
    const pagesize = option.pagesize ? option.pagesize : 20;
    findOption = findOption ? findOption : {};
    findOption.limit = pagesize;
    // 计算总数
    const countOption = {};
    if (typeof findOption.where !== 'undefined') {
      countOption.where = findOption.where;
    }
    if (typeof findOption.include !== 'undefined') {
      countOption.include = findOption.include;
    }
    const total = await model.count(countOption);

    const pagination = this.pagination({
      total,
      page,
      pagesize,
    });
    if (total === 0) {
      return {
        list: [],
        pagination,
      };
    }
    findOption.offset = pagination.offset;

    const list = await model.findAll(findOption);
    return {
      list,
      pagination,
    };
  }


  /**
   * 查询详情
   */
  async show() {
    const id = parseInt(this.ctx.params.id);
    if (id < 1) {
      return this.ctx.jsonReturn(992, {}, 'Lost ID');
    }
    const where = {
      [this.modelPK]: id,
    };
    const res = await this.ctx.model[this.modelName].findOne({
      where,
    });
    return this.ctx.jsonReturn(0, res, 'Successfully');
  }


  /**
   * 删除
   */
  async destroy() {
    const { ctx } = this;

    const ids = ctx.request.query.id ? ctx.request.query.id : ctx.request.body.id;
    if (!ids) {
      return ctx.jsonReturn(-1, '请选择要删除的数据');
    }
    const idsArray = ids.toString().split(',');
    const Op = ctx.model.Op;
    const where = {};
    const pk = this.modelPK;
    if (idsArray.length > 1) {
      where[pk] = {
        [Op.in]: idsArray,
      };
    } else {
      where[pk] = ids;
    }
    const res = await this.ctx.model[this.modelName].destroy({ where, force: true });
    if (res) {
      return ctx.jsonReturn(0, 'Successfully');
    }
    return ctx.jsonReturn(-1, 'Failed');
  }


}

module.exports = BaseController;
