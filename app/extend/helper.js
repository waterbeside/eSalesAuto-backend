'use strict';

const crypto = require('crypto');

module.exports = {

  /**
   * 转换字典key的大小写
   * @param {Object} jsonObj
   * @param {Integer} type 当为0时转小写，1时转大写
   */
  changeCaseJsonKey(jsonObj, type = 0) {
    for (const key in jsonObj) {
      const nkey = type ? key.toUpperCase() : key.toLowerCase();
      jsonObj[nkey] = jsonObj[key];
      if (nkey !== key) {
        delete (jsonObj[key]);
      }
    }
    return jsonObj;
  },

  /**
   * MD5加密
   *
   * @param {*} str 要加密的字符串
   */
  md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
  },

  /**
   * 数字位数补全
   *
   * @param {Integer} num  要补全的数字
   * @param {Integer} length  总位数
   */
  prefixO(num, length) {
    return (Array(length).join('0') + num).slice(-length);
  },

  /**
   * 替换指定位置的字符串
   * @param {String} str      原字符全
   * @param {Integer} start   起始位
   * @param {Number} stop     结束位
   * @param {String} replacer
   */
  replaceStr(str, start, stop, replacer) {
    if (str.substring(start, stop) === replacer) {
      return str;
    }
    return str.substring(0, start) + replacer + str.substring(stop, str.length);

  },

  /**
   * 取得缓存
   * @param {String} key 缓存key
   * @param {String} prefix key前缀
   */
  async getStoreData(key, prefix = 'autoSale') {
    key = prefix ? prefix + ':' + key : key;
    if (typeof (this.app.myData) !== 'undefined' && typeof (this.app.myData[key]) !== 'undefined') {
      return this.app.myData[key];
    }
    if (typeof (this.app.redis) === 'object') {
      const redis = this.app.redis;
      const caceData = await redis.get(key);
      if (caceData) {
        const data = JSON.parse(caceData);
        if (!data) {
          return null;
        }
        return data;
      }
    }
    return null;
  },

  async setStoreData(key, value, ex = 0, prefix = 'autoSale') {
    key = prefix ? prefix + ':' + key : key;
    if (typeof (this.app.redis) === 'object' && ex > -1) {
      const redis = this.app.redis;
      const dataString = JSON.stringify(value);
      if (ex > 0) {
        await redis.setex(key, ex, dataString);
      } else {
        await redis.set(key, dataString);
      }
    } else {
      if (typeof (this.app.myData) === 'undefined') {
        this.app.myData = {};
      }
      this.app.myData[key] = value;
    }

    return;
  },


  /**
   * 验证工具
   */
  validate: {
    isNoSpaces(str) {
      if (str.indexOf(' ') >= 0) {
        return false;
      }
      return true;
    },

    isNoSpecialBut_(str) {
      const reg = /^[a-zA-Z0-9_]{1,}$/;
      console.log(str);
      return reg.test(str);
    },

    isURL(url) {
      const reg = /^(https?|ftp):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/;
      return reg.test(url);
    },

    isLowerCase(str) {
      const reg = /^[a-z]+$/;
      return reg.test(str);
    },

    isUpperCase(str) {
      const reg = /^[A-Z]+$/;
      return reg.test(str);
    },

    isAlphabets(str) {
      const reg = /^[A-Za-z]+$/;
      return reg.test(str);
    },

    isEmail(email) {
      const reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return reg.test(email);
    },
  },
};
