'use strict';

const moment = require('moment');

module.exports = {

  /**
   * 用于接口输出,返回指定的json
   * @param {Integer} code 状态码
   * @param {Object} data 要返回的数据
   * @param {String} msg 要返回的消息
   * @param {Object} extra 返回的扩展数据
   */
  jsonReturn(code, data = null, msg = '', extra = null) {
    if (typeof (data) === 'string') {
      msg = data;
      data = null;
    }
    const date = moment().unix();

    this.body = {
      code,
      data,
      msg,
      date,
      extra,
    };
    return false;
    // process.exit(1);
  },
};
