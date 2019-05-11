'use strict';

const crypto = require('crypto');
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('User', {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: STRING(255),
    password: STRING(32),
    roles: STRING(32),
    salt: STRING(6),
    sales_team: STRING(20),
  },
  {freezeTableName: true,
    timestamps: false,
  }
 );

 User.errorMsg = '';
 User.errorCode = '';

  User.findByUsername = async function(username) {
    return await this.findOne({
      where: { username:username },
    });
  };

  User.findByUid = async function(uid){
    return await this.findOne({
      where: { id:uid },
    });
  }

  User.checkLoginByPassword = async function(username,password){
      let now = parseInt(new Number(new Date().getTime()/1000).toFixed(0));

      var userData = await this.findByUsername(username);
      if(!userData){
        this.errorCode = 10002;
        this.errorMsg = '查不到用户名';
        return  false;
      }
      var hash_pw = User.hashPassword(password,userData.salt);
      if(hash_pw != userData.password){
        this.errorCode = 10001;
        this.errorMsg = '用户名或密码错误';
        return  false;
      }

      var jwtData = {
        exp: now + 3600*24*2, //过期时间
        iat: now, //发行时间
        iss: 'Esquel Sale System',
        uid: userData.id,
        username: userData.username,
      }
      var returnData = {
        username : username,
        rid : userData.rid,
        uid : userData.id,
        token: app.jwt.sign(jwtData, app.config.jwt.secret),
      }
      return returnData;

  };

  User.hashPassword = function(password,salt){
    var hash_1 = crypto.createHash('md5').update(password).digest('hex');
    var hash_2 = hash_1 + "" + salt;
    return crypto.createHash('md5').update(hash_2).digest('hex');
  }

  return User;
};
