const secret = require('./secret.js');

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
      timezone: '+08:00' 
      // other sequelize configurations
    },
   
  ],
};


exports.oracle = {
  client: {
    user: secret.oracle.username,
    password: secret.oracle.password,
    connectString: secret.oracle.connectString,
  },
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

exports.redis = {
  client: {
    port: secret.redis.port,          // Redis port
    host: secret.redis.host,   // Redis host
    password: secret.redis.password,
    db: 0,
  },
}

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
