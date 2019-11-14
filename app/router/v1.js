'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {

  const { router, controller } = app;
  const permission = app.middleware.checkPermission;


  router.get('/', controller.v1.home.index);

  // 用户通行证模块
  router.post('/api/v1/passport/login', controller.v1.passport.login);
  router.get('/api/v1/passport', permission(), controller.v1.passport.index);
  router.delete('/api/v1/passport', controller.v1.passport.logout);
  router.get('/api/v1/passport/customer_code', permission(), controller.v1.passport.customer_code);
  router.patch('/api/v1/passport/change_pass', permission(), controller.v1.passport.change_pass);


  // User模块
  router.get('/api/v1/user/check_unique', permission(), controller.v1.user.checkUnique); // 验证唯一
  router.resources('/api/v1/user', permission([ 'admin' ]), controller.v1.user);
  router.delete('/api/v1/user', permission([ 'admin' ]), controller.v1.user.destroy); // 删除


  // SPPO模块
  router.get('/api/v1/sppo', permission([ 'master', 'general' ]), controller.v1.sppo.index); // 列表
  router.post('/api/v1/sppo', permission([ 'master', 'general' ]), controller.v1.sppo.save); // 新建
  router.delete('/api/v1/sppo', permission([ 'master', 'general' ]), controller.v1.sppo.del); // 删除
  router.get('/api/v1/sppo/check_customer_fab_code_exist', permission([ 'master', 'general' ]), controller.v1.sppo.checkCustomerFabCodeExist);
  router.get('/api/v1/sppo/get_customer_fab_codes', permission([ 'master', 'general' ]), controller.v1.sppo.getCustomerFabCodes);
  router.get('/api/v1/sppo/detail', permission([ 'master', 'general' ]), controller.v1.sppo.detail); // 明细
  router.put('/api/v1/sppo/batch', permission([ 'master', 'general' ]), controller.v1.sppo.batchEdit); // 批量编辑
  router.put('/api/v1/sppo', permission([ 'master', 'general' ]), controller.v1.sppo.edit); // 编辑

  // GO模块
  router.get('/api/v1/go', permission([ 'master', 'general' ]), controller.v1.go.index); // 列表
  router.post('/api/v1/go', permission([ 'master', 'general' ]), controller.v1.go.save); // 新建
  router.delete('/api/v1/go', permission([ 'master', 'general' ]), controller.v1.go.del); // 删除
  router.get('/api/v1/go/detail', permission([ 'master', 'general' ]), controller.v1.go.detail); // 明细
  router.put('/api/v1/go/batch', permission([ 'master', 'general' ]), controller.v1.go.batchEdit); // 批量编辑
  router.put('/api/v1/go', permission([ 'master', 'general' ]), controller.v1.go.edit); // 编辑


  // Role模块
  router.get('/api/v1/role/selects', permission([ 'admin' ]), controller.v1.role.selects); // 列表

  // brand
  router.get('/api/v1/gen_brand/get_brand_code', permission([ 'master', 'general' ]), controller.v1.genBrand.getBrandCode);
  router.get('/api/v1/gen_brand/get_label', permission([ 'master', 'general' ]), controller.v1.genBrand.getLabel);
  // factory
  router.get('/api/v1/gen_factory/get_factory_ids', permission([ 'master', 'general' ]), controller.v1.genFactory.getFactoryIds);
  // washType
  router.get('/api/v1/gen_wash_type/check_exist', permission([ 'master', 'general' ]), controller.v1.genWashType.checkExist);
  router.get('/api/v1/gen_wash_type/wash_types', permission([ 'master', 'general' ]), controller.v1.genWashType.getWashTypes);

  // fabric type
  router.get('/api/v1/fab_fabric_type/check_exist', permission([ 'master', 'general' ]), controller.v1.fabFabricType.checkExist);

  // master_fabrication_ln
  router.get('/api/v1/master_fabrication_ln', permission([ 'master', 'general' ]), controller.v1.masterFabricationLN.index);
  router.get('/api/v1/master_fabrication_ln/:id', permission([ 'master', 'general' ]), controller.v1.masterFabricationLN.show);
  router.post('/api/v1/master_fabrication_ln', permission([ 'master' ]), controller.v1.masterFabricationLN.create);
  router.patch('/api/v1/master_fabrication_ln/:id', permission([ 'master' ]), controller.v1.masterFabricationLN.update);
  router.delete('/api/v1/master_fabrication_ln', permission([ 'master' ]), controller.v1.masterFabricationLN.destroy); // 删除

  router.get('/api/v1/master_fabrication_ln/get_customer_fab_codes', permission([ 'master', 'general' ]), controller.v1.masterFabricationLN.getCustomerFabCodes);
  router.get('/api/v1/master_fabrication_ln/check_exist', permission([ 'master', 'general' ]), controller.v1.masterFabricationLN.checkExist);

  // master_size
  router.get('/api/v1/master_size/sizes', permission([ 'master', 'general' ]), controller.v1.masterSize.getSizes);

  // master_go_marekt
  router.get('/api/v1/master_go_market', permission([ 'master', 'general' ]), controller.v1.masterGoMarket.index);

  // master_qty_ld
  router.get('/api/v1/master_qty_ld/get_garment_parts', permission([ 'master', 'general' ]), controller.v1.masterQtyLd.getGarmentParts);


};
