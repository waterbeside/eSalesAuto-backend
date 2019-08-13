'use strict';

const moment = require('moment');
const crypto = require('crypto');
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('User',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: STRING(255),
      status: INTEGER,
      is_delete: INTEGER,
      password: STRING(32),
      roles: STRING(32),
      salt: STRING(6),
      sales_team: STRING(20),
      FullName: STRING(20),
      email: STRING(255),
      last_login_time: {
        type: DATE,
        get() {
          return moment(moment(this.getDataValue('last_login_time')).utc().format('YYYY-MM-DD HH:mm:ss'));
        },
      },
      create_time: {
        type: DATE,
        get() {
          return moment(moment(this.getDataValue('create_time')).utc().format('YYYY-MM-DD HH:mm:ss'));
        },
      },
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  User.errorMsg = '';
  User.errorCode = '';

  User.findByUsername = async function(username) {
    return await this.findOne({
      where: { username, is_delete: 0 },
    });
  };

  User.findByUid = async function(uid) {
    return await this.findOne({
      where: { id: uid },
    });
  };

  User.checkLoginByPassword = async function(username, password) {
    const date = new Date().UTC();
    const now = (date / 1000).toFixed(0);

    // const now = parseInt(new Number(new Date().getTime() / 1000).toFixed(0));

    const userData = await this.findByUsername(username);
    if (!userData) {
      this.errorCode = 10002;
      this.errorMsg = '查不到用户名';
      return false;
    }
    if (userData.status < 1) {
      this.errorCode = 10003;
      this.errorMsg = '用户名已被禁用';
      return false;
    }
    const hash_pw = User.hashPassword(password, userData.salt);
    if (hash_pw !== userData.password) {
      this.errorCode = 10001;
      this.errorMsg = '用户名或密码错误';
      return false;
    }

    const jwtData = {
      exp: now + 3600 * 24 * 2, // 过期时间
      iat: now, // 发行时间
      iss: 'Esquel Sale System',
      uid: userData.id,
      username: userData.username,
      roles: userData.roles ? userData.roles.split(',') : [],
    };
    const returnData = {
      username,
      roles: userData.roles,
      uid: userData.id,
      token: app.jwt.sign(jwtData, app.config.jwt.secret),
    };
    return returnData;

  };

  /**
   * 密码加密
   * @param {string} password password
   * @param {string} salt 盐
   * @param {string} type 1:第一层md5加密，0:第一层不加密
   */
  User.hashPassword = function(password, salt, type = 0) {
    let hash_1 = '';
    if (type) {
      hash_1 = crypto.createHash('md5').update(password).digest('hex');
    } else {
      hash_1 = password;
    }
    const hash_2 = hash_1 + '' + salt;
    return crypto.createHash('md5').update(hash_2).digest('hex');
  };

  /**
   * 创建加密密码和盐
   * @param {string} pass 原始密码
   * @param {integer} type 1:第一层md5加密，0:第一层不加密
   */
  User.createPassword = function(pass, type = 0) {
    const salt = crypto.randomBytes(Math.ceil(3)).toString('hex').slice(0, 6);
    const password = this.hashPassword(pass, salt, type);
    return { salt, password };
  };


  /**
   * 检验用户名唯一
   * @param {string} username 用户名
   * @param {integer} exclude_id 排除id
   */
  User.checkUnique = async function(username, exclude_id) {
    const Op = app.Sequelize.Op;
    const where = {
      username,
      is_delete: 0,
    };
    if (exclude_id) {
      where.id = {
        [Op.ne]: exclude_id,
      };
    }
    const cnt = await this.count({ where });
    if (cnt > 0) {
      return false;
    }
    return true;


  };

  return User;
};
