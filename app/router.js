'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {

  const { router, controller } = app;
  const checktoken = app.middleware.checktoken();

  router.get('/', controller.v1.home.index);
  router.get('/api/v1/test', controller.v1.test.index);
  router.get('/api/v1/test/:id', controller.v1.test.show);
  router.get('/api/v1/passport', checktoken,controller.v1.passport.index);
  router.post('/api/v1/passport/login', controller.v1.passport.login);
  // router.get('/passport',controller.passport.index);
  // router.get('/passport/login', controller.passport.login);

};
