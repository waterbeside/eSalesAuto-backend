'use strict';

/**
 *
 */
const BaseService = require('./Base');
const moment = require('moment');
const crypto = require('crypto');

class UserService extends BaseService {


  /**
   * 登入验证
   * @param {String} username  用户名
   * @param {String} password  1次md5后的密码
   */
  async checkLoginByPassword(username, password) {
    const userData = await this.ctx.model.User.findByUsername(username);
    if (!userData) {
      this.setError(10002, '查不到用户名');
      return false;
    }
    if (userData.status < 1) {
      this.setError(10003, '用户名已被禁用');
      return false;
    }
    const hash_pw = this.hashPassword(password, userData.salt);
    if (hash_pw !== userData.password) {
      this.setError(10001, '用户名或密码错误');
      return false;
    }

    const returnData = {
      username,
      roles: userData.roles,
      uid: userData.id,
      token: this.createJwt(userData, 3600 * 24 * 2),
    };
    return returnData;
  }

  /**
   * 从db2的GEN_USERS表入库到db1的User表
   * @param {String} username 用户名
   * @param {String} password 密码（第一次md5加密后的）
   * @param {Boolean} isCheckMaster 是否检查主库用户的存在
   * @return {Boolean} 返回成功与否
   */
  async syncUser(username, password = false, isCheckMaster = true) {
    // 检查db1是否已经存在该用户
    if (isCheckMaster) {
      const userData_1 = await this.ctx.model.User.findByUsername(username);
      if (userData_1) {
        this.setError(10006, '用户已经存在');
        return false;
      }
    }
    // 检查db2该用户是否存在
    const userData = await this.ctx.service.genUsers.getDataByUsername(username, true);
    if (!userData) {
      this.setError(10002, '用户不存在');
      return false;
    }
    // 制作密码
    const pass_o = typeof userData.DEPARTMENT_ID === 'string' ? userData.DEPARTMENT_ID.toLowerCase() + '12345678' : '12345678';
    const pass_md5 = this.ctx.helper.md5(pass_o);
    if (password !== pass_md5) {
      this.setError(10001, '用户名或密码错误');
      return false;
    }
    const createPassRes = this.createPassword(password, 0);
    const pass_hash = createPassRes.password;
    const salt = createPassRes.salt;
    // 创建要插入到db1的数据
    const inData = {
      username: userData.USER_ID,
      password: pass_hash,
      salt,
      FullName: userData.NAME,
      sales_team: userData.DEPARTMENT_ID,
      roles: 'general',
      status: 1,
      create_time: new Date(),
      is_delete: 0,
    };
    const res = await this.ctx.model.User.create(inData);
    if (res) {
      inData.id = res.id;
      return inData;
    }
    this.setError(-1, '添加用户失败');
    return false;


  }


  /**
   * 创建JWT
   * @param {Object} userData 用户数据
   * @param {Integer} exp 多少秒后过期
   */
  createJwt(userData, exp = 3600 * 24 * 2) {
    const now = moment().unix();
    const jwtData = {
      exp: now + exp, // 过期时间
      iat: now, // 发行时间
      iss: 'Esquel Sale System',
      uid: userData.id,
      username: userData.username,
      roles: userData.roles ? userData.roles.split(',') : [],
    };
    return this.app.jwt.sign(jwtData, this.app.config.jwt.secret);
  }

  /**
   * 密码加密
   * @param {String} password password
   * @param {String} salt 盐
   * @param {String} type 1:第一层md5加密，0:第一层不加密
   */
  hashPassword(password, salt, type = 0) {
    let hash_1 = '';
    if (type) {
      hash_1 = crypto.createHash('md5').update(password).digest('hex');
    } else {
      hash_1 = password;
    }
    const hash_2 = hash_1 + '' + salt;
    return crypto.createHash('md5').update(hash_2).digest('hex');
  }

  /**
   * 创建加密密码和盐
   * @param {String} pass 原始密码
   * @param {Integer} type 1:第一层md5加密，0:第一层不加密
   */
  createPassword(pass, type = 0) {
    const salt = crypto.randomBytes(Math.ceil(3)).toString('hex').slice(0, 6);
    const password = this.hashPassword(pass, salt, type);
    return { salt, password };
  }


}

module.exports = UserService;
