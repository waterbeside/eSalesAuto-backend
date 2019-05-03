'use strict';

// had enabled by egg
// exports.static = true;
exports.jwt = {
  enable: true,
  package: "egg-jwt"
};
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};
exports.mssql = {
  enable: true,
  package: 'egg-mssql',
};

exports.oracle = {
  enable: false,
  package: 'egg-oracle',
};

exports.redis = {
  enable: false,
  package: 'egg-redis',
};

exports.cors = {
    enable: true,
    package: 'egg-cors',
};

exports.passport = {
  enable: true,
  package: 'egg-passport',
};

//
// /** @type Egg.EggPlugin */
// module.exports = ()=>{
//   const config = {};
//   // had enabled by egg
//   // static: {
//   //   enable: true,
//   // }
//   config.mssql = {
//     enable: true,
//     package: 'egg-mssql',
//   };
//
//   config.sequelize = {
//     enable: true,
//     package: 'egg-sequelize'
//   }
//
//   return {
//     ...config,
//   };
//
// };
