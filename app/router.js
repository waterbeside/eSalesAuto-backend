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
  router.get('/api/v1/sppo',checktoken(),controller.v1.sppo.index);  //列表
  router.post('/api/v1/sppo',checktoken(),controller.v1.sppo.save);  //新建
  router.delete('/api/v1/sppo',checktoken(),controller.v1.sppo.del); //删除
  router.get('/api/v1/sppo/check_customer_fab_code_exist',checktoken(),controller.v1.sppo.checkCustomerFabCodeExist);
  router.get('/api/v1/sppo/detail',checktoken(),controller.v1.sppo.detail); //明细
  router.put('/api/v1/sppo/batch',checktoken(),controller.v1.sppo.batchEdit); //批量编辑
  router.put('/api/v1/sppo',checktoken(),controller.v1.sppo.edit); //编辑

  //GO模块
  router.get('/api/v1/go',checktoken(),controller.v1.go.index);  //列表
  router.post('/api/v1/go',checktoken(),controller.v1.go.save);  //新建
  router.delete('/api/v1/go',checktoken(),controller.v1.go.del); //删除
  router.get('/api/v1/go/detail',checktoken(),controller.v1.go.detail); //明细
  router.put('/api/v1/go/batch',checktoken(),controller.v1.go.batchEdit); //批量编辑
  router.put('/api/v1/go',checktoken(),controller.v1.go.edit); //编辑
  

  //brand
  router.get('/api/v1/gen_brand/get_brand_code',checktoken(),controller.v1.genBrand.getBrandCode);
  //factory
  router.get('/api/v1/gen_factory/get_factory_ids',checktoken(),controller.v1.genFactory.getFactoryIds);
  //washType
  router.get('/api/v1/gen_wash_type/check_exist',checktoken(),controller.v1.genWashType.checkExist);
  router.get('/api/v1/gen_wash_type/wash_types',checktoken(),controller.v1.genWashType.getWashTypes);
  
  //fabric type
  router.get('/api/v1/fab_fabric_type/check_exist',checktoken(),controller.v1.fabFabricType.checkExist);

  //master_fabrication_ln
  router.get('/api/v1/master_fabrication_ln',checktoken(),controller.v1.masterFabricationLN.index);
  router.get('/api/v1/master_fabrication_ln/check_exist',checktoken(),controller.v1.masterFabricationLN.checkExist);

  //master_size 
  router.get('/api/v1/master_size/sizes',checktoken(),controller.v1.masterSize.getSizes);
  
  //master_go_marekt 
  router.get('/api/v1/master_go_market',checktoken(),controller.v1.masterGoMarket.index);

  
};
