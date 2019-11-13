'use strict';

const moment = require('moment');
const _ = require('lodash');
const sqlBuilder = require('../extend/sqlBuilder');
const SB = new sqlBuilder();

const Service = require('egg').Service;
class BaseService extends Service {

  // constructor(app) {
  //   super(app);
  //   // this.table = 'ESCMOWNER.PPO_HD';
  // }

  setError(errorCode, errorMsg = '', data = null) {
    this.errorCode = errorCode;
    this.errorMsg = errorMsg;
    this.data = data;
  }

  getError() {
    const errorCode = this.errorCode || 0;
    const errorMsg = this.errorMsg || '';
    const data = this.data || null;
    return { errorCode, errorMsg, data };
  }


  formatOracleRes(res) {
    const metaData = res.metaData;
    const rows = res.rows;
    const list = [];

    rows.forEach((item, index) => {
      const item_kv = {};
      metaData.forEach((field, i) => {
        // console.log(field.name)

        item_kv[field.name] = item[i];
      });
      list[index] = item_kv;
    });

    return list;
  }


  async query(model, sql, isFind = 0) {
    const time = moment().valueOf();
    try {
      if ([ 'model', 'model2' ].includes(model)) {
        const res = await this.ctx[model].query(sql);
        return isFind === 1 ? res[0][0] : res[0];
      }
      if (model === 'oracle') {
        const connection = await this.app.oracle.getConnection();
        const res = await connection.execute(sql);
        connection.close();
        console.log(`[${moment().format('YYYY-MM-DD HH:mm')}][${model}](${(moment().valueOf() - time)}ms) ${sql}`);
        return isFind === 1 ? this.formatOracleRes(res)[0] : this.formatOracleRes(res);
      }
      return false;
    } catch (err) {
      console.log(`[${moment().format('YYYY-MM-DD HH:mm')}][${model}](${(moment().valueOf() - time)}ms) ${sql}`);
      console.log(err.message);
    }
    return false;
  }

  async dataCount(setting, field = '*') {
    let sql = '';
    if (_.isString(setting)) {
      sql = setting;
    } else {
      const fieldStr = `count(${field}) C`;
      const joinStr = typeof setting.join !== 'undefined' && setting.join ? SB.joiner(setting.join) : '';
      const whereStr = typeof setting.map !== 'undefined' && setting.map ? SB.where(setting.map) : '';
      const orderStr = _.isString(setting.order) ? 'ORDER BY' + setting.order : '';
      const table = typeof setting.table !== 'undefined' ? setting.table : (this.tableName ? this.tableName : '');
      if (!table) {
        return false;
      }
      sql = `SELECT ${fieldStr} FROM ${table} ${joinStr} WHERE ${whereStr} ${orderStr}`;
    }

    let c = 0;
    try {
      const res = await this.query('oracle', sql, 1);
      c = res.C;
    } catch (err) {
      console.log(err.message);
    }
    return c;
  }

  async pageSelect(setting, page = 1, pagesize = 100) {
    let sql_0 = '';
    const defaults = {
      field: '*',
    };
    const rowStart = (page - 1) * pagesize;
    const rowEnd = page * pagesize;
    if (_.isString(setting)) {
      sql_0 = setting;
    } else {
      const opt = Object.assign({}, defaults, setting);
      const fieldStr = opt.field ? opt.field : '*';
      const joinStr = typeof opt.join !== 'undefined' && opt.join ? SB.joiner(opt.join) : '';
      const whereStr = typeof opt.map !== 'undefined' && opt.map ? SB.where(opt.map) : '';
      const orderStr = _.isString(opt.order) ? 'ORDER BY' + opt.order : '';
      const table = typeof opt.table !== 'undefined' ? opt.table : (this.tableName ? this.tableName : '');
      if (!table) {
        return false;
      }
      sql_0 = `SELECT ${fieldStr} FROM ${table} ${joinStr} WHERE ${whereStr} ${orderStr}`;
    }
    let res = false;
    try {
      const sql = `SELECT * FROM (
            SELECT rownum NA_ROWNUM , oracle_table.* FROM (${sql_0}) oracle_table )
            where NA_ROWNUM > ${rowStart} AND NA_ROWNUM <=${rowEnd}`;
      res = await this.query('oracle', sql, 0);
    } catch (err) {
      console.log(err.message);
    }
    return res;
  }
}

module.exports = BaseService;
