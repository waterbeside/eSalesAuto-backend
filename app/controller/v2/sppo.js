'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class SppoController extends BaseController {

  /**
   * SPPO列表
   */
  async index() {
    const { ctx } = this;
    const ppo_no = ctx.request.query.ppo_no;
    // const season = ctx.request.query.season;
    const date_start = ctx.request.query.date_start ? parseInt(ctx.request.query.date_start) : 0;
    const date_end = ctx.request.query.date_end ? parseInt(ctx.request.query.date_end) : 0;
    const userData = await this.getUserData();
    const username = userData.username;


    const pagesize = ctx.request.query.pagesize ? ctx.request.query.pagesize : 20;
    const page = ctx.request.query.page ? ctx.request.query.page : 1;
    // 筛选
    const map = [];
    map.push([ '', 'raw', `CREATE_USER_ID = '${username}'` ]);
    if (ppo_no) {
      map.push([ 'PPO_NO', 'like', `%${ppo_no}%` ]);
    }
    if (date_start && date_end) {
      map.push([ 'PPO_DATE', 'raw', ` >= to_date('${moment(date_start).format('YYYY-MM-DD HH:mm:ss')}', 'yyyy-mm-dd hh24:mi:ss')` ]);
      map.push([ 'PPO_DATE', 'raw', ` < to_date('${moment(date_end + (1000 * 60 * 60 * 24)).format('YYYY-MM-DD HH:mm:ss')}', 'yyyy-mm-dd hh24:mi:ss')` ]);
    }
    const order = ' PPO_DATE DESC ';
    const total = await this.ctx.service.ppoHd.dataCount({ map }, 'PPO_NO');

    const field = `PPO_NO, PPO_DATE, SUPPLIER_CD, CCY_CD, STATUS, CREATE_DATE, CREATE_USER_ID, LAST_MODI_DATE , LAST_MODI_USER_ID, 
    CUSTOMER_CD, YEAR, UOM, STYLE_NO, SAMPLE_TYPE, CUSTOMER_SEASON, CUSTOMER_STYLE_NO`;
    const list = await this.ctx.service.ppoHd.pageSelect({ map, order, field }, page, pagesize);
    if (list === false) {
      return ctx.jsonReturn(-1, list, '查询失败');
    }
    // console.log(list);
    const pagination = this.pagination({ total, page, pagesize });

    const returnData = {
      list,
      pagination,
    };
    return ctx.jsonReturn(0, returnData, 'Successful');
  }


  /**
   * 添加SPPO
   */
  async save() {
    const { ctx } = this;
    // const Op = ctx.model.Op;
    const data = ctx.request.body.data;
    const customer_code = ctx.request.body.customer_code;
    const brand = ctx.request.body.brand;
    const brand_lable_cd = ctx.request.body.brand_lable_cd;
    const brand_lable_desc = ctx.request.body.brand_lable_desc;
    const garment_fty = ctx.request.body.garment_fty;
    // return ctx.jsonReturn(0);

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
    const delivery = await ctx.model.MasterLeadTime.getDeliveryByCC(customer_code);// 计算交期
    if (!shipModeData) {
      return ctx.jsonReturn(992, '查询不到 SHIP_MODE 数据，请到Master Center添加基础数据');
    }

    // 取得与客户码相关的数据
    // const customerData = await ctx.model.MasterCollarCuffSize.findAllByCcd(customer_code);

    let hasError = 0;
    let errorMsg = '';
    let errorData = null;

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
        errorMsg = "'相同Style_No, 相同Garment_Part, 只可以出现一个Customer_Fab_Code，请重新检查再提交'";
        break;
      }

    }

    // 开始制作sppo Json
    const sppoJson_sn_kv = {};
    const res = {};
    for (const style_no in style_no_kv_list) {
      const dataList = style_no_kv_list[style_no];
      sppoJson_sn_kv[style_no] = await ctx.service.sppoJson.createDataJson(dataList, { formData, userData, sizeList, shipModeData, delivery });
      if (!sppoJson_sn_kv[style_no]) {
        hasError = true;
        const errorRes = ctx.service.sppoJson.getError();
        errorData = errorRes.data;
        errorMsg = errorRes.errorMsg;
        break;
      }
      // return ctx.jsonReturn(992, { sppoJson_sn_kv, res, errorData }, errorMsg);

      // console.log(sppoJson_sn_kv[style_no]);
      let itemRes = false;
      try {
        itemRes = await ctx.http.post('https://escm-ppo-az-fn-app-uat.azurewebsites.net/api/generateKnitSPPO', sppoJson_sn_kv[style_no]);
        console.log('itemRes');
        console.log(itemRes);
      } catch (err) {
        hasError = true;
        console.log('err');
        itemRes = err.response.data;
      }
      res[style_no] = itemRes;
    }
    if (hasError) {
      return ctx.jsonReturn(992, { sppoJson_sn_kv, res, errorData }, errorMsg);
    }


    return ctx.jsonReturn(0, { sppoJson_sn_kv, res }, 'Successful');


    // console.log(sppoJson_sn_kv);

  }

}

module.exports = SppoController;
