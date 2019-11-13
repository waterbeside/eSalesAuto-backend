'use strict';

const crypto = require('crypto');

module.exports = {

  /**
   * 转换字典key的大小写
   * @param {Object} jsonObj 被转换的以像
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


  json_decode(str) {
    let data = false;
    try {
      data = JSON.parse(str);
    } catch (error) {
      console.log(error.message);
    }
    return data;
  },

  json_encode(obj) {
    return JSON.stringify(obj);
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
   * @param {String} replacer 新字符串
   */
  replaceStr(str, start, stop, replacer) {
    if (str.substring(start, stop) === replacer) {
      return str;
    }
    return str.substring(0, start) + replacer + str.substring(stop, str.length);
  },

  /**
   * 给有可能为undefined的变量设置默认值
   * @param {*} field 要设置默认值的变量|字段
   * @param {*} def 当data为undefined或为false时，返回的默认值
   * @param {*} data 当data设有值时，field则作为data对像的key
   */
  setDefault(field, def = '', data = false) {
    if (data !== false) {
      return data && field && typeof data[field] !== 'undefined' && data[field] ? data[field] : def;

    }
    // return typeof field !== 'undefined' && field ? field : def;
    return def;
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
   * 缓存
   * @param {String|Object} key String:缓存的key, 当为Object时为缓存设置，再使用返回的run方法执行
   * @param {*} value 要值存的数据
   * @param {Integer} ex 有效时长
   * @param {String} prefix 缓存的key的前缀.
   */
  cache(key, value = false, ex = 0, prefix = 'autoSale') {
    if (typeof key === 'object') {
      let setting = key;
      const defaults = {
        prefix: 'autoSale',
        app: this.app,
      };
      setting = Object.assign({}, defaults, setting);
      return {
        run: async (key, value = false, ex = 0) => {
          key = setting.prefix + ':' + key;
          if (typeof (setting.app.redis) === 'object') {
            const redis = setting.app.redis;
            if (value === null) {
              // 删缓存
              return await redis.delete(key);
            } else if (value !== false) {
              // 写缓存
              const dataString = JSON.stringify(value);
              if (ex > 0) {
                return await redis.setex(key, ex, dataString);
              }
              return await redis.set(key, value);
            }
            // 取缓存
            const str = await redis.get(key);
            const redData = str !== false ? JSON.parse(str, true) : false;
            return redData;
          }
          return false;
        },
      };
    }
    return new Promise((resole, reject) => {
      this.cache({ prefix }).run(key, value, ex).then(res => {
        resole(res);
      })
        .catch(err => {
          reject(err);
        });
    });
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
