const secret = require('./secret.js');

console.log(secret.mssql);

exports.sequelize = {
  datasources: [
    {
      delegate: 'model', // load all models to app.model and ctx.model
      baseDir: 'model', // load models from `app/model/*.js`
      dialect: 'mssql', // support: mysql, mariadb, postgres, mssql
      database: 'SystemDataDB',
      host: secret.mssql.host,
      port: secret.mssql.port,
      username: secret.mssql.username,
      password: secret.mssql.password,
      // other sequelize configurations
    },
    // {
    //   delegate: 'admninModel', // load all models to app.adminModel and ctx.adminModel
    //   baseDir: 'admin_model', // load models from `app/admin_model/*.js`
    //   database: 'admin',
    //   // other sequelize configurations
    // },
  ],
};



exports.mssql = {


  // Multi Databases
  clients: {
    db1: {
      database: 'SystemDataDB',
      server: secret.mssql.host,
      port: secret.mssql.port,
      user: secret.mssql.username,
      password: secret.mssql.password,
    },
  },
  app: true,
};

// exports.mysql = {
//   client: {
//     host:'localhost',
//     port: '3306',
//     user: 'root',
//     password: 'root',
//     database: 'douban_egg'
//   },
//   app: true,
//   agent: false
// };
