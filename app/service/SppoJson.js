'use strict';

const moment = require('moment');
const _ = require('lodash');
const Service = require('egg').Service;
class SppoJsonService extends Service {

  /**
   * 生成一个用于请求sppo接口的json数据
   * @param {Array} data 用于创建请求Json的数据，来源于用户上传的excel表数据
   * @param {Object} extData 扩展数据
   */
  async createDataJson(data, extData) {
    if (data.length < 1) {
      return false;
    }
    const { formData, userData, sizeList } = extData;
    const username = userData.username;
    let REMARKS = '';
    data.forEach(item => {
      REMARKS += REMARKS.trim() === '' ? REMARKS + ' ### ' + item.remark : item.remark;
    });
    const season = data[0].season;
    const seasonData = await this.getSeasonData(season);
    if (!seasonData) {
      return false;
    }

    // 先处理头字段
    const PPO_HD = {
      PPO_NO: '',
      PPO_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
      SUPPLIER_CD: 'G31200',
      SHIP_TERM_CD: '',
      SHIP_MODE_CD: '',
      PAY_TERM_CD: '',
      CCY_CD: 'USD',
      REMARKS,
      STATUS: 'L2',
      OPA_FLAG: 'N',
      FINAL_GARMENT_FACTORY_CD: formData.garment_fty,
      CREATE_USER_ID: username,
      CREATE_USER_GRP_ID: userData.gen.DEPARTMENT_ID,
      CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
      LAST_MODI_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
      LAST_MODI_USER_ID: username,
      LAST_MODI_USER_GRP_ID: userData.gen.DEPARTMENT_ID,
      DOWNLOAD_FLAG: 'N',
      PPO_REV_NO: '0',
      FTY_CONTACT: userData.ctm.Attention_To,
      PERCENT_OVER_ALLOWED: userData.ctm.Over_Ship_Tolerance,
      PERCENT_SHORT_ALLOWED: userData.ctm.Short_Ship_Tolerance,
      FLAG: 'Y',
      CUSTOMER_CD: formData.customer_code,
      REGION_CD: '',
      SEASON_CD: seasonData.season.code,
      PROGRAM_NO: '',
      SOURCE_NO: '',
      SOURCE: '',
      MOC_FLAG: 'N',
      BILL_TO_PARTY_CD: '',
      GMT_TRADE_TERM: '',
      PPO_TYPE: 'A3',
      REQ_USER_ID: username,
      REQ_USER_GRP_ID: userData.gen.DEPARTMENT_ID,
      PROJECT_NO: '',
      ORDER_TYPE: 'KNSP',
      ATTACHMENT: '',
      OPA_FACTORY_CD: '',
      YEAR: seasonData.year,
      YPD_REL_SIGN: '',
      FLG_DIRECT_FABRIC_SALES: '',
      BRAND_CD: formData.brand,
      FEATURE_CD: '',
      SHORT_LEADTIME_FLAG: 'N',
      FABRIC_NATURE_CD: 'K',
      UOM: 'YDS',
      PAY_TO: 'G31200',
      SAM_GROUP_CD: 'STANDARD',
      BUYER_GRP_CD: userData.ctm.Buyer_Group,
      SHIPMENT_OS_ALLOWANCE: userData.ctm.Ship_Tolerance,
      BUYER_GRP_REV_REASON: '',
      ORG_FINAL_GARMENT_FACTORY_CD: '',
      ORG_OPA_FACTORY_CD: '',
      ORG_SAM_GROUP_CD: '',
      ORG_CREATE_USER_GRP_ID: '',
      ORG_REQ_USER_GRP_ID: '',
      NEED_SHIPMENT_SAMPLE: '',
      VMI_FLAG: 'N',
      GOTS: 'N',
      TRIM_FAB_FLAG: '',
      FAB_PERCENT_OVER_ALLOWED: '0',
      FAB_PERCENT_SHORT_ALLOWED: '0',
      STYLE_NO: formData.brand + '-' + data[0].style_no,
      SAMPLE_TYPE: 'GMT',
      SWATCH_REQUEST: userData.ctm.Swatch_Req,
      TEST_REPORT: '',
      CHARGE_METHOD: '',
      WASH_DEVELOP_NO: '1', // TODO:未确定值
      CUSTOMER_SEASON: seasonData.season.name,
      GMT_SAMPLE_TYPE_CD: '',
      PPC_STATUS: '',
      COLLAR_CUFF_UOM: typeof sizeList[0] !== 'undefined' && sizeList[0].UOM ? sizeList[0].UOM : '',
      PRESSING_METHOD: '',
      NEW_KPPO_FLAG: 'Y',
      CUST_SUB_DEPT: '',
      SWATCH_RECEIVER: userData.ctm.A4_Receiver,
      HARD_LINK_FLAG: '',
      NEED_MATCHING_FLAG: 'Y',
      CUST_LABEL_CD: formData.brand_lable_cd,
      REPLENISHMENT_FLAG: 'N',
      REPLENISHMENT_REACON_CODE: '',
      REPLENISHMENT_REACON_DESC: '',
      NPD_CODE: '',
      FAB_NO: '',
      CUSTOMER_STYLE_NO: formData.brand + '-' + data[0].style_no,
      RESERVATION_NO: '',
      QUALITY_REMARKS: '',
      MULTI_SALES_ID: username,
      BOM_REMARKS: '',
      CUST_LABEL_DESC: formData.brand_lable_cd,
    };

    // 创建PPO_ITEM
    const PPO_ITEM = [];
    const PPO_ITEM_COMB = [];
    for (const index in data) {
      const item = data[index];
      const masterLnData = await this.ctx.service.sppoHelper.findMstFabAndCcByCfcAndGP(item.customer_fab_code, item.garment_part);
      const mergData = masterLnData.mergData;


      const REF_PPO_NO = mergData.Refer_PPO_Usage.substring(0, mergData.Refer_PPO_Usage.length - 2);
      const REF_PPO_GP = mergData.Refer_PPO_Usage.substring(mergData.Refer_PPO_Usage.length - 1, mergData.Refer_PPO_Usage.length);
      const qcMainInfo = await this.ctx.service.qcMainInfo.findByQcRefPpo(REF_PPO_NO);
      const QUALITY_CODE = qcMainInfo ? qcMainInfo.QUALITY_CODE : ''; // TODO: 未确定数据来源 可能是 QCMAININFO 表？
      // console.log(qcMainInfo);continue;
      const PPO_ITEM_ID =  index + 1;
      // PPO_ITEM
      const itemData = {
        PPO_ITEM_ID,
        newFlag: true,
        FABRIC_TYPE_CD: item.garment_part,
        MATERIAL_GROUP: qcMainInfo ? qcMainInfo.MATERIAL_GROUP : '', // TODO: 未确定数据来源 可能是 QCMAININFO 表？
        FULLY_COPY: 'Y',
        QUALITY_CODE, // TODO: 未确定数据来源 可能是 QCMAININFO 表？
        FABRIC_WIDTH: mergData.Fab_Width,
        DESCRIPTION: mergData.Fab_Desc,
        REMARKS: mergData.Fab_Remark,
        STATUS: 'N', // TODO: ???
        COMPONENT_PART: item.garment_component,
        PRINT_FLAG: item.print,
        EMBROIDERY_FLAG: 'N', // TODO: ???
        CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
        CREATE_USER_ID: username,
        LAST_MODI_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
        LAST_MODI_USER_ID: username,
        QUALITY_REF_PPO_NO: REF_PPO_NO, // TODO: 未确定数据来源 可能是 QCMAININFO 表？
        QUALITY_REF_GARMENT_PART: REF_PPO_GP, // TODO: 未确定数据来源 可能是 QCMAININFO 表？
        HANDFEEL_REF_PPO_NO: REF_PPO_NO, // TODO: 未确定数据来源 可能是 QCMAININFO 表？  qcMainInfo ? qcMainInfo.HF_REF_PPO : ''
        HANDFEEL_REF_GARMENT_PART: REF_PPO_GP, // TODO: 未确定数据来源 可能是 QCMAININFO 表？ qcMainInfo ? qcMainInfo.HF_REF_GP : ''
        REF_REMARKS: qcMainInfo ? qcMainInfo.RF_REMARK : '',
        refQC: qcMainInfo ? qcMainInfo.QUALITY_CODE : '',
        styleIndex: 1, // TODO: ???
        colorwayIndex: 0, // TODO: ???
        garmentPartIndex: 0, // TODO: ???
      };
      PPO_ITEM.push(itemData);

      // PPO_ITEM_COMB
      const colorArray = item.color_name.split('/');
      for (let colorIndex in colorArray) {
        const colorItem = colorArray[colorIndex];
        const ITEM_COMBO_ID = PPO_ITEM_COMB.length + 1;
        const itemCombData = {
          ITEM_COMBO_ID,
          PPO_ITEM_ID,
          QUALITY_CODE,
          FABRIC_TYPE_CD: item.garment_part,
          FAB_COMBO_ID: colorIndex + 1, // TODO: ???

        };
        PPO_ITEM_COMB.push(itemCombData);
      }

      


    }
    return { PPO_HD, PPO_ITEM };

  }


  /**
   * 通过excel导入的season字段数据，取得年分和季节码等信息
   * @param {String} season 从excel表导入的seasonn字段数据
   */
  async getSeasonData(season) {
    season = season.toLowerCase();
    const seasonSplit = season.split('q');
    const seasonCodes = {
      q1: {
        code: 'SP',
        name: 'SPRING',
      },
      q2: {
        code: 'SU',
        name: 'SUMMER',
      },
      q3: {
        code: 'FL',
        name: 'FALL',
      },
      q4: {
        code: 'WN',
        name: 'WINTER',
      },
    };
    const year = '20' + seasonSplit[0];
    if (typeof seasonSplit[1] === 'undefined' || typeof seasonCodes['q' + seasonSplit[1]] === 'undefined') {
      return false;
    }
    return {
      season: seasonCodes['q' + seasonSplit[1]],
      year,
    };
  }

  // async getItemAssit

}

module.exports = SppoJsonService;
