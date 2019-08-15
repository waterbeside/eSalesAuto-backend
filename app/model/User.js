'use strict';

const moment = require('moment');
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


  /**
   * 检验用户名唯一
   * @param {String} username 用户名
   * @param {Integer} exclude_id 排除id
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
