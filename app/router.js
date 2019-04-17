'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {

  const { router, controller } = app;
  const checktoken = app.middleware.checktoken();

  router.get('/', controller.home.index);
  router.get('/test', controller.test.index);
  router.get('/test/:id', controller.test.show);
  router.get('/passport', checktoken,controller.passport.index);
  // router.get('/passport',controller.passport.index);
  // router.get('/passport/login', controller.passport.login);
  router.post('/passport/login', controller.passport.login);

};
