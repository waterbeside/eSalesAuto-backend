/* eslint valid-jsdoc: "off" */

'use strict';
const db_setting = require('./config.db.js');
const secret = require('./secret.js');
/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1554338444255_5656';

  // add your middleware config here
  config.middleware = [];

  config.cluster = {
    listen: {
      port: 7002,
      hostname: '127.0.0.1',
      // path: '/var/run/egg.sock',
    }
  }



  config.jwt = {
    secret: secret.jwt.secret,
  };

  


  config.security = {
    csrf: {
        enable: false,
        ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
    },
    domainWhiteList: ['http://localhost:3001']
  };

  config.cors = {
    origin:'*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH'
  };


  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    sequelize:db_setting.sequelize,
    mssql:db_setting.mssql,
    oracle:db_setting.oracle,
    redis:db_setting.redis,
    
  };


  return {
    ...config,
    ...userConfig,
  };
};
