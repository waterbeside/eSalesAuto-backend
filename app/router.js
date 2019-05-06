'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {

  const { router, controller } = app;
  const checktoken = app.middleware.checktoken;

  
  router.get('/', controller.v1.home.index);

  //用户模块
  router.get('/api/v1/test', controller.v1.test.index);
  router.get('/api/v1/test/:id', controller.v1.test.show);
  router.get('/api/v1/passport', checktoken(),controller.v1.passport.index);
  router.post('/api/v1/passport/login', controller.v1.passport.login);
  router.delete('/api/v1/passport',checktoken(), controller.v1.passport.logout);
  router.get('/api/v1/passport/customer_code', checktoken(),controller.v1.passport.customer_code);
  
  // router.get('/passport',controller.passport.index);
  // router.get('/passport/login', controller.passport.login);

  //SPPO模块
  router.get('/api/v1/sppo',checktoken(),controller.v1.sppo.index);
  router.post('/api/v1/sppo',checktoken(),controller.v1.sppo.save);
  router.delete('/api/v1/sppo',checktoken(),controller.v1.sppo.del);
  
  //brand
  router.get('/api/v1/gen_brand/get_brand_code',checktoken(),controller.v1.genBrand.getBrandCode);
  //factory
  router.get('/api/v1/gen_factory/get_factory_ids',checktoken(),controller.v1.genFactory.getFactoryIds);
  //washType
  router.get('/api/v1/gen_wash_type/check_exist',controller.v1.genWashType.checkExist);
  //fabric type
  router.get('/api/v1/fab_fabric_type/check_exist',controller.v1.fabFabricType.checkExist);

  //master_fabrication_ln
  router.get('/api/v1/master_fabrication_ln',controller.v1.masterFabricationLN.index);
  router.get('/api/v1/master_fabrication_ln/check_exist',controller.v1.masterFabricationLN.checkExist);

  
};
