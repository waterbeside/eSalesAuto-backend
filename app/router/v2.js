'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {

  const { router, controller } = app;
  const permission = app.middleware.checkPermission;


  // 用户通行证模块
  router.post('/api/v2/passport/login', controller.v2.passport.login);

  // SPPO模块
  router.get('/api/v2/sppo', permission([ 'master', 'general' ]), controller.v2.sppo.index); // 列表
  router.post('/api/v2/sppo', permission([ 'master', 'general' ]), controller.v2.sppo.save); // 新建


};
