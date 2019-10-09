'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const axios = require('axios');
const _ = require('lodash');

class SppoController extends BaseController {

  /**
   * 添加SPPO
   */
  async save() {
    const { ctx } = this;
    const Op = ctx.model.Op;
    const data = ctx.request.body.data;
    const customer_code = ctx.request.body.customer_code;
    const brand = ctx.request.body.brand;
    const brand_lable_cd = ctx.request.body.brand_lable_cd;
    const brand_lable_desc = ctx.request.body.brand_lable_desc;
    const garment_fty = ctx.request.body.garment_fty;


    const formData = {
      customer_code,
      brand,
      garment_fty,
      brand_lable_cd,
      brand_lable_desc,
    };

    // 创建用户数据
    const userData = await this.getUserData();
    const genUserData = await this.service.genUsers.getDataByUsername(userData.username, false, '*', 3600);
    userData.gen = genUserData;
    const userCustomerData = await ctx.model.MasterGenUser.findDataByUserCcd(userData.username, customer_code);
    userData.ctm = userCustomerData;

    // 取得尺码数据列表
    const sizeList = await ctx.model.MasterCollarCuffSize.findAllByCcd(customer_code);

    // 取得ShipMode数据
    const shipModeData = await ctx.model.MasterShipMode.getShipModeByCC(customer_code);


    // 取得与客户码相关的数据
    // const customerData = await ctx.model.MasterCollarCuffSize.findAllByCcd(customer_code);

    let hasError = 0;
    let errMsg = '';

    if (typeof (data) !== 'object') {
      return ctx.jsonReturn(992, '请上传数据');
    }
    const style_no_kv_list = _.groupBy(data, 'style_no');

    // console.log(style_no_kv_list);

    /**
     * 检查
     */
    for (const style_no in style_no_kv_list) {
      const dataList = style_no_kv_list[style_no];
      // 验证重复的 Garment_Part Customer_Fab_Code;
      if (!ctx.service.sppoHelper.check_gp_cfc_same(dataList)) {
        hasError = 1;
        errMsg = "'相同Style_No, 相同Garment_Part, 只可以出现一个Customer_Fab_Code，请重新检查再提交'";
        break;
      }

    }

    // 开始制作sppo Json
    const sppoJson_sn_kv = {};
    const res = {};
    for (const style_no in style_no_kv_list) {
      const dataList = style_no_kv_list[style_no];
      sppoJson_sn_kv[style_no] = await ctx.service.sppoJson.createDataJson(dataList, { formData, userData, sizeList, shipModeData });
      // console.log(sppoJson_sn_kv[style_no]);
      let itemRes = false;
      try {
        itemRes = await ctx.http.post('https://escm-ppo-az-fn-app-uat.azurewebsites.net/api/generateKnitSPPO',sppoJson_sn_kv[style_no]);
        console.log('itemRes');
        console.log(itemRes);
      } catch (err) {
        console.log('err');
        itemRes = err.response.data;
      }
      res[style_no] = itemRes;
    }
    console.log(res);

    return ctx.jsonReturn(992, { sppoJson_sn_kv, res });


    // console.log(sppoJson_sn_kv);

  }

}

module.exports = SppoController;
