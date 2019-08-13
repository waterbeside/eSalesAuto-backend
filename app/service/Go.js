'use strict';

const moment = require('moment');
const _ = require('lodash');
const Service = require('egg').Service;
class GoService extends Service {


  // get sppoDetail
  async getDetail(go_no) {
    const { ctx, app } = this;

    const data = {};
    data.goTitle = await ctx.model.GoTitle.findOne({
      where: { GO_NO: go_no, Is_Active: 1 },
      order: [[ 'Rev_NO', 'DESC' ]],
    });
    if (!data.goTitle) {
      return null;
    }
    const GO_ID = data.goTitle.GO_ID;
    const GO_NO = data.goTitle.GO_NO;
    data.goTitle.setDataValue('Create_Time', moment(data.goTitle.Create_Time).valueOf());
    data.goTitle.setDataValue('Update_Time', moment(data.goTitle.Update_Time).valueOf());

    data.goLotInfo = await ctx.model.GoLotInfo.findAll({
      where: { GO_ID },
    });

    data.goColorQty = await ctx.model.GoColorQty.findAll({
      where: { GO_ID },
    });


    return data;
  }


  /**
   * 生成GO_NO前部分
   * @param {string} gmt_fty gmt_fty
   */
  async buildBaseGoNo(gmt_fty) {
    const { ctx, app } = this;
    const cacheKey = 'sppo:baseGoNo:fty_' + gmt_fty;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.service.genFactory.getFactorysByFtyID(gmt_fty);
    if (!res) {
      return false;
    }
    const f_Code = res.FTY_ID_FOR_GO;
    const year_no = moment().format('YY');
    const baseGoNo = 'S' + year_no + f_Code;
    await ctx.helper.setStoreData(cacheKey, baseGoNo, -1);
    return baseGoNo;
  }

  /**
   * 转厂后更新GO_NO
   */
  async updateGoNo(gmt_fty, GO_NO) {
    const { ctx, app } = this;
    const res = await ctx.service.genFactory.getFactorysByFtyID(gmt_fty);
    if (!res) {
      return false;
    }
    const f_Code = res.FTY_ID_FOR_GO;
    return ctx.helper.replaceStr(GO_NO, 3, 4, f_Code);
  }


  /**
   * 生成JO_NO前部分
   */
  async buildJoNo(GO_NO, Warehouse, LOT_NO) {
    const { ctx, app } = this;
    const go_no_len = GO_NO.length;
    const go_no_x = GO_NO.substring(1, go_no_len);
    const res = await this.getMarketByWarehouse(Warehouse);

    if (!res) {
      return false;
    }
    const Market_Quota = res.Market_Quota;
    const res2 = await ctx.service.genCountry.getCountryByName(Market_Quota);

    if (!res2) {
      return false;
    }
    const country_cd = res2.COUNTRY_CD;
    return go_no_x + country_cd + ctx.helper.prefixO(LOT_NO, 2);

  }

  async getMarketByWarehouse(Warehouse) {
    const { ctx, app } = this;
    const cacheKey = 'master:goMarket:WH_' + Warehouse;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.model.MasterGoMarket.getOneByWarehouse(Warehouse);
    if (!res) {
      return false;
    }
    await ctx.helper.setStoreData(cacheKey, res, 60);
    return res;
  }


  /**
   * 通过 style_no 和 combo生成 SKU
   * @param {String} style_no style_no
   * @param {String} combo combo
   */
  getSKU(style_no, combo) {
    let sku = '';
    if (typeof (combo) !== 'undefined' && combo.length > 3) {
      const combo_no = combo.substring(0, 2);
      if (parseInt(combo_no) > 0) {
        sku = style_no + '-' + parseInt(combo_no);
      }
    }
    return sku;
  }

  /**
   * 检查列表中，相同的某一个字段，其它所有另一个字段必须相同
   * @param {Object} row  当前行
   * @param {Object} list 当前列表
   * @param {Array} fields 要查的字段
   */
  checkMustSame(row, list, fields) {
    let code = 0;
    const msg = '';
    const otherdRowIndex = list.findIndex(item => {
      return (_.trim(item[fields[0]]) === _.trim(row[fields[0]]) && _.trim(item[fields[1]]) !== _.trim(row[fields[1]]) && item.id !== row.id);
    });
    if (otherdRowIndex !== -1) {
      code = 1;
      return otherdRowIndex;
    }
    return -1;
  }


}

module.exports = GoService;
