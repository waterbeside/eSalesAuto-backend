'use strict';

const moment = require('moment');
const _ = require('lodash');
const BaseService = require('./Base');
// const Service = require('egg').Service;
class SppoJsonService extends BaseService {

  /**
   * 生成一个用于请求sppo接口的json数据
   * @param {Array} data 用于创建请求Json的数据，来源于用户上传的excel表数据
   * @param {Object} extData 扩展数据
   */
  async createDataJson(data, extData) {
    const helper = this.ctx.helper;
    if (data.length < 1) {
      return false;
    }
    let hasError = false;
    let errorRowData = {};
    const {
      formData,
      userData,
      sizeList,
      shipModeData,
      delivery, // 交期
    } = extData;
    const username = userData.username;
    let REMARKS = '';
    data.forEach(item => {
      REMARKS += REMARKS.trim() === '' ? REMARKS + ' ### ' + item.remark : item.remark;
    });

    const WASH_TYPE_DESC = data[0].garment_wash;
    const washData = await this.ctx.service.genWashType.findByDesc(WASH_TYPE_DESC);
    if (!washData) {
      return false;
    }

    const COLLAR_CUFF_UOM = typeof sizeList[0] !== 'undefined' && sizeList[0].UOM ? sizeList[0].UOM : '';
    const today = moment().format('YYYY-MM-DD HH:mm:ss');
    const CCY_CD = 'USD';
    const CUSTOMER_STYLE_NO = data[0].style_no;
    const STYLE_NO = formData.brand + '-' + CUSTOMER_STYLE_NO;
    const CUSTOMER_CD = String(formData.customer_code);
    const season = data[0].season;
    const seasonData = await this.getSeasonData(season);
    if (!seasonData) {
      errorRowData = { style_no: CUSTOMER_STYLE_NO };
      this.setError(992, `season解析失败, style_no = ${CUSTOMER_STYLE_NO}`, errorRowData);
      hasError = true;
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
      CCY_CD,
      REMARKS,
      STATUS: 'L2',
      OPA_FLAG: 'N',
      FINAL_GARMENT_FACTORY_CD: formData.garment_fty,
      CREATE_USER_ID: username,
      CREATE_USER_GRP_ID: userData.gen.DEPARTMENT_ID,
      CREATE_DATE: today,
      LAST_MODI_DATE: today,
      LAST_MODI_USER_ID: username,
      LAST_MODI_USER_GRP_ID: userData.gen.DEPARTMENT_ID,
      DOWNLOAD_FLAG: 'N',
      PPO_REV_NO: '0',
      FTY_CONTACT: userData.ctm.Attention_To,
      PERCENT_OVER_ALLOWED: userData.ctm.Over_Ship_Tolerance,
      PERCENT_SHORT_ALLOWED: userData.ctm.Short_Ship_Tolerance,
      FLAG: 'Y',
      CUSTOMER_CD,
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
      UOM: 'YDS', // XXX: '默认YDS'
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
      STYLE_NO,
      SAMPLE_TYPE: 'GMT',
      SWATCH_REQUEST: userData.ctm.Swatch_Req,
      TEST_REPORT: '',
      CHARGE_METHOD: '',
      WASH_DEVELOP_NO: 'Non-Wash', //  Wash Remark 默认'Non-Wash'
      CUSTOMER_SEASON: seasonData.season.name,
      GMT_SAMPLE_TYPE_CD: '',
      PPC_STATUS: '',
      COLLAR_CUFF_UOM,
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
      CUSTOMER_STYLE_NO,
      RESERVATION_NO: '',
      QUALITY_REMARKS: '',
      MULTI_SALES_ID: username,
      BOM_REMARKS: '',
      CUST_LABEL_DESC: formData.brand_lable_cd,
    };

    const garment_part_kv_list = _.groupBy(data, 'garment_part');
    // console.log(garment_part_kv_list);


    // 创建PPO_ITEM 等相关
    const PPO_ITEM = [];
    const PPO_ITEM_COMBO = [];
    const PPO_ITEM_COMBO_LABDIP = [];
    const PPO_ITEM_SIZE = [];
    // const FAB_LABDIP_LIB = [];
    const PPO_ITEM_LOT_HD = [];
    const PPO_ITEM_LOT_DT = [];
    // ...
    let PPOX_WASH_TYPE = {};
    const PPO_QCMAININFO = [];
    const PPO_QCFINISHDTL = [];
    const PPO_QCCONSTRUCTIONDTL = [];
    const PPO_QCYARNDTL = [];
    const PPO_REV_STIMULATE = [];
    const PPO_REV_HIST = [];
    const PPO_STYLE = [];
    // ...
    const QCMAININFO = [];
    const QCFINISHDTL = [];
    const QCCONSTRUCTIONDTL = [];
    const QCYARNDTL = [];
    const QCCUSTOMERLIBRARY = [];
    const PPOX_ATTACHMENT = [];
    const SEND_XML_TRANS = [];

    /** PPOX_WASH_TYPE */
    PPOX_WASH_TYPE = {
      PPO_NO: '',
      SEQ: '1', // XXX:???
      WASH_TYPE_CD: washData.WASH_TYPE_CD,
      WASH_TYPE_DESC,
      WASH_CATEGORY: washData.WASH_CATEGORY,
    };

    for (const garment_part in garment_part_kv_list) {
      if (hasError) {
        break;
      }
      const itemList = garment_part_kv_list[garment_part];
      const item = itemList[0];
      const FABRIC_TYPE_CD = item.garment_part;
      const COMPONENT_PART = this.formatGarmentComponent(item.garment_component);
      const getMasterLnRes = await this.ctx.service.sppoHelper.findMstFabAndCcByCfcAndGP(item.customer_fab_code, item.garment_part);
      errorRowData = { style_no: CUSTOMER_STYLE_NO, garment_part, customer_fab_code: item.customer_fab_code };
      if (!getMasterLnRes) {
        this.setError(992, `通过Customer_Fab_Code:${item.customer_fab_code}查找基础信息失败，请上传正确的 Customer_Fab_Code，或在Master Center添加对应的基础数据`, errorRowData);
        hasError = true;
        break;
      }
      const masterLnData = getMasterLnRes.mergData;

      const REF_PPO_NO = masterLnData.Refer_PPO_Usage.substring(0, masterLnData.Refer_PPO_Usage.length - 2);
      const REF_PPO_GP = masterLnData.Refer_PPO_Usage.substring(masterLnData.Refer_PPO_Usage.length - 1, masterLnData.Refer_PPO_Usage.length);

      const QUALITY_CODE = await this.ctx.service.sppoHelper.getQualityCodeByPpoFcd(REF_PPO_NO, REF_PPO_GP); // 查找 QUALITY_CODE;
      if (!QUALITY_CODE) {
        this.setError(992, `通过Customer_Fab_Code:${item.customer_fab_code}查找QUALITY_CODE失败，请上传正确的 Customer_Fab_Code`, errorRowData);
        hasError = true;
        break;
      }
      const qcMainInfo = await this.ctx.service.qcMainInfo.findByQc(QUALITY_CODE);
      const qcFinishDtl = await this.ctx.service.qcFinishDtl.findByQc(QUALITY_CODE);
      // const pbKintConstructionData = await this.ctx.service.pbKnitConstruction.findByDesc(masterLnData.Fab_Desc);
      const constructionData = await this.ctx.service.qcConstructionDtl.findByQc(QUALITY_CODE);

      // const qtyData = await this.ctx.model.MasterQtyLD.findByGP(item.garment_part);
      const UOM_CD = await this.ctx.model.MasterUnit.getUnitByGP(item.garment_part);

      // const sizeArray = item.size.split('/');
      // const garmentQtyArray = String(item.garment_qty).split('/');
      // const colorArray = item.color_name.split('/');
      // const colorCodeArray = item.color_code.split('/');
      const finishingArray = masterLnData.Finishing.split(',');
      // console.log(masterLnData);

      // console.log(qcMainInfo);continue;
      const PPO_ITEM_ID = PPO_ITEM.length + 1;
      // PPO_ITEM
      const itemData = {
        PPO_ITEM_ID,
        newFlag: true,
        FABRIC_TYPE_CD,
        MATERIAL_GROUP: qcMainInfo.MATERIAL_GROUP, // XXX: 未确定数据来源 可能是 QCMAININFO 表？
        FULLY_COPY: 'Y',
        QUALITY_CODE, // XXX,
        FABRIC_WIDTH: helper.setDefault('Fab_Width', '', masterLnData),
        DESCRIPTION: helper.setDefault('Fab_Desc', '', masterLnData),
        REMARKS: helper.setDefault('Fab_Remark', item.customer_fab_code, masterLnData),
        STATUS: 'N', // XXX: ???
        COMPONENT_PART,
        PRINT_FLAG: item.print,
        EMBROIDERY_FLAG: 'N', // XXX: ???
        CREATE_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
        CREATE_USER_ID: username,
        LAST_MODI_DATE: moment().format('YYYY-MM-DD HH:mm:ss'),
        LAST_MODI_USER_ID: username,
        QUALITY_REF_PPO_NO: REF_PPO_NO, // TODO: 未确定数据来源
        QUALITY_REF_GARMENT_PART: REF_PPO_GP, // TODO: 未确定数据来源
        HANDFEEL_REF_PPO_NO: REF_PPO_NO, // TODO: 未确定数据来源
        HANDFEEL_REF_GARMENT_PART: REF_PPO_GP, // TODO: 未确定数据来源
        REF_REMARKS: helper.setDefault('RF_REMARK', '', qcMainInfo),
        refQC: QUALITY_CODE,
        styleIndex: 1, // XXX: ???
        colorwayIndex: 0, // XXX: ???
        garmentPartIndex: 0, // XXX: ???
      };
      PPO_ITEM.push(itemData);

      // 预设 ITEM_LOT_HD_ID;
      const ITEM_LOT_HD_ID = PPO_ITEM_LOT_HD.length + 1;
      let TOTAL_ORDER_QTY = 0;

      if (hasError) {
        break;
      }

      const itemCombo_hasPush = [];
      const itemSizeData_hasPush = [];
      const colorArrayData = {};
      for (const i in itemList) {
        const itemListData = itemList[i];
        errorRowData.i = i;
        /** PPO_ITEM_COMBO */
        const { color_code, color_name } = this.formatColor(itemListData.color);
        const itemCombo_pkey = `COLOR_${itemListData.color}`;
        if (!itemCombo_hasPush.includes(itemCombo_pkey)) {
          const fabComboData = await this.ctx.service.fabCombo.findByQualityCode(QUALITY_CODE, color_name);
          const ITEM_COMBO_ID = PPO_ITEM_COMBO.length + 1;

          /** PPO_ITEM_COMBO */
          const itemComboData = {
            ITEM_COMBO_ID,
            PPO_ITEM_ID,
            QUALITY_CODE, // xxx: 要IT API 生成？
            FABRIC_TYPE_CD,
            FAB_COMBO_ID: fabComboData.FAB_COMBO_ID, // XXX: 
            VAT_RATE: '',
            CCY_CD,
            UOM_CD,
            YPD: '',
            APAC_ORDER_FLAG: 'N', // XXX: 默认空白？
            REMARKS: '',
            STATUS: 'N', // XXX: 不确定
            GMT_COLOR_CODE: color_code,
            FABRIC_CODE: fabComboData.FABRIC_CODE, // XXX: ESCMOWNER.FAB_COMBO？
            COMBO_NAME: color_name,
            LAYOUT: fabComboData.LAYOUT, // XXX: 从master表取？
            CREATE_DATE: today,
            CREATE_USER_ID: username,
            LAST_MODI_DATE: today,
            LAST_MODI_USER_ID: username,
            styleIndex: 1, // XXX: ???
            colorwayIndex: 0, // XXX: ???
            garmentPartIndex: 0, // XXX: ???
            newFlag: true, // XXX: ???
          };
          PPO_ITEM_COMBO.push(itemComboData);

          /** PPO_ITEM_COMBO_LABDIP */
          const fabComboLabdipData = await this.service.fabComboLab.findByFabComboId(fabComboData.FAB_COMBO_ID);
          if (!fabComboLabdipData) {
            this.setError(992, `通过FAB_COMBO_ID:"${fabComboData.FAB_COMBO_ID}"查找FAB_COMBO_LAB数据失败`, errorRowData);
            hasError = true;
            break;
          }

          const fabLabdipLibData = await this.service.fabLabdipLib.findById(fabComboLabdipData.LABDIP_LIBRARY_ID);
          if (!fabLabdipLibData) {
            this.setError(992, `通过LABDIP_ID:"${fabComboLabdipData.LABDIP_ID}"查找FAB_LABDIP_LIB数据失败`, errorRowData);
            hasError = true;
            break;
          }
          const COMBO_LABDIP_ID = PPO_ITEM_COMBO_LABDIP.length + 1;
          const itemComboLabdipData = {
            COMBO_LABDIP_ID,
            LABDIP_ID: fabComboLabdipData.LABDIP_ID, // 从FAB_COMBO_LAB表取
            PPO_ITEM_ID,
            ITEM_COMBO_ID,
            FAB_COMBO_ID: fabComboData.FAB_COMBO_ID,
            CUSTOMER_COLOR_NAME: color_name,
            COLOR_STANDARD: fabComboLabdipData.COLOR_STANDARD,
            CREATE_USER_ID: fabComboLabdipData.CREATE_USER_ID,
            CREATE_DATE: fabComboLabdipData.CREATE_DATE,
            LAST_MODI_USER_ID: fabComboLabdipData.LAST_MODI_USER_ID,
            LAST_MODI_DATE: fabComboLabdipData.LAST_MODI_DATE,
            LABDIP_LIBRARY_ID: fabComboLabdipData.LABDIP_LIBRARY_ID,
            SEQ: fabComboLabdipData.SEQ,
            LABDIP_REQ_NO: fabLabdipLibData.LABDIP_REQ_NO,
            LABDIP_REQ_SEQ: fabLabdipLibData.LABDIP_REQ_SEQ,
            CUSTOMER_CD: fabLabdipLibData.CUSTOMER_CD,
            YEAR: seasonData.year, // XXX: ??? or null ?
            SEASON_CD: seasonData.season.code,
            REQ_FABRICATION: fabLabdipLibData.REQ_FABRICATION,
            MILL_COLOR_CODE: fabLabdipLibData.MILL_COLOR_CODE,
            LABDIP_COLOR_NAME: fabLabdipLibData.LABDIP_COLOR_NAME,
            GROUP_NO: fabLabdipLibData.GROUP_NO,
            LABDIP_PPO_NO: fabLabdipLibData.LABDIP_PPO_NO,
            SHADE: fabLabdipLibData.SHADE,
            RED: fabLabdipLibData.RED,
            GREEN: fabLabdipLibData.GREEN,
            BLUE: fabLabdipLibData.BLUE,
            STATUS: fabLabdipLibData.STATUS,
            LABDIP_APPROVAL_DATE: fabLabdipLibData.LABDIP_APPROVAL_DATE,
            BUYER_COMMENT: fabLabdipLibData.BUYER_COMMENT,
            REMARK: '', // helper.setDefault('Remark', '', colorComboData)''
            styleIndex: 1, // XXX: ???
            colorwayIndex: 0, // XXX: ???
            garmentPartIndex: 0, // XXX: ???
            labdipIndex: 0, // XXX: ???
            newFlag: true, // XXX: ???
          };
          PPO_ITEM_COMBO_LABDIP.push(itemComboLabdipData);

          itemCombo_hasPush.push(itemCombo_pkey);
          // 把数据放入colorArrayData以便复用
          colorArrayData[itemListData.color] = {
            // colorComboData,
            itemComboData,
            itemComboLabdipData,
            fabLabdipLibData,
            fabComboData,
            fabComboLabdipData,
          };
        }

        /** PPO_ITEM_SIZE */
        const itemSizeData_pKey = `SEX_${itemListData.sex}:SIZE_${itemListData.size}:COLOR_${itemListData.color}`;

        if (!itemSizeData_hasPush.includes(itemSizeData_pKey)) {
          // 计算Total qty;
          const ORDER_QTY = parseInt(itemData.garment_qty);
          TOTAL_ORDER_QTY += ORDER_QTY;

          const ITEM_SIZE_ID = PPO_ITEM_SIZE.length + 1;
          // const dSize = sizeItem.substring(sizeItem.length - 1, sizeItem.length); // 从excel的size中拆出尺码
          // const dSex = sizeItem.substring(0, sizeItem.length - 1); // 从excel的size中拆出性别
          const dSex = itemListData.sex;
          const dSize = itemListData.size;
          if (dSize && dSex) {
            let sizeData = null;
            for (const sI in sizeList) {
              const sE = sizeList[sI];
              if (sE.Size.toLowerCase() === dSize.toLowerCase() && sE.Sex === dSex) {
                sizeData = sE;
                break;
              }
            }
            const L_Int = helper.setDefault('L_Int', 0, sizeData);
            const L_Fra = helper.setDefault('L_Fra', 0, sizeData);
            const H_Int = helper.setDefault('H_Int', 0, sizeData);
            const H_Fra = helper.setDefault('H_Fra', 0, sizeData);
            const size_UOM = helper.setDefault('UOM', '', sizeData);
            const SIZE_MEASUREMENT = (L_Int + L_Fra) + size_UOM + 'X' + (H_Int + H_Fra) + size_UOM;
            const itemSizeData = {
              ITEM_SIZE_ID,
              PPO_ITEM_ID,
              FABRIC_TYPE_CD,
              QUALITY_CODE,
              SIZE_CODE: dSize, // XXX: ???
              SIZE_MEASUREMENT,
              APAC_ORDER_FLAG: 'N', // XXX: ???
              REMARKS: dSize, // XXX: ???
              CREATE_DATE: today,
              CREATE_USER_ID: username,
              LAST_MODI_DATE: today,
              LAST_MODI_USER_ID: username,
              STATUS: 'N', // XXX: ???
              UOM_CD, // XXX: 通过Garment_Part取Unit?
              // UNIT_PRICE: null, // XXX: ???
              // PRICE_UPDATE_DATE: null, // XXX: ???
              SIZE_SEQ: '',
              SIZE_WIDTH_INT: L_Int,
              SIZE_WIDTH_FRA: L_Fra,
              SIZE_HEIGHT_INT: H_Int,
              SIZE_HEIGHT_FRA: H_Fra,
              SIZE_UM: size_UOM, // XXX: ???
              styleIndex: 1, // XXX: ???
              colorwayIndex: 0, // XXX: ???
              garmentPartIndex: 0, // XXX: ???
              fkMmtIndex: 0, // XXX: ???
              newFlag: true, // XXX: ???
            };
            PPO_ITEM_SIZE.push(itemSizeData);
            itemSizeData_hasPush.push(itemSizeData_pKey);

            /** PPO_ITEM_LOT_DT */
            const {
              itemComboData,
            } = colorArrayData[itemListData.color];
            const itemLotDtData = {
              ITEM_LOT_DT_ID: PPO_ITEM_LOT_DT.length + 1,
              ITEM_LOT_HD_ID,
              PPO_ITEM_ID,
              FABRIC_TYPE_CD,
              ITEM_COMBO_ID: itemComboData.ITEM_COMBO_ID,
              GMT_COLOR_CODE: itemComboData.GMT_COLOR_CODE,
              ITEM_SIZE_ID,
              SIZE_CODE: dSize,
              LOT_NO: 1,
              ORDER_QTY,
              STATUS: 'N',
              MIS_STATUS: '', // XXX: ???
              MIS_LOCK_FLAG: '', // XXX: ???
              ORIGINAL_ITEM_LOT_HD_ID: null,
              ORIGINAL_ITEM_LOT_DT_ID: null,
              styleIndex: 1, // XXX: ???
              colorwayIndex: 0, // XXX: ???
              garmentPartIndex: 0, // XXX: ???
              orderLotIndex: 0, // XXX: ???
              newFlag: true, // XXX: ???

              // GMT_QTY: 0,
              // ON_HOLD: null,
              // UNIT_PRICE: null,
              // CCY_CD: null,
              // PRICE_UPDATE_DATE: null,
              // PPOX_LOT_ID: null,
              // EEM_PRICE: null,
              // FTY_PRICE: null,
              // PPO_PRICE: null,
              // PRICE_FLAG: 'N',
              // MOQ_QTY: null,
              // IND_REQUIRE_QTY: null,
            };
            PPO_ITEM_LOT_DT.push(itemLotDtData);
          }
          
        } // end if size


      } // end of itemList loop

      /** PPO_ITEM_LOT_HD */
      const itemLotHdData = {
        ITEM_LOT_HD_ID,
        PPO_ITEM_ID,
        QUALITY_CODE, // TODO: 未确定数据来源 找IT出接口？
        FABRIC_TYPE_CD,
        LOT_NO: 1,
        FAB_DEL_DATE: delivery, // 交期
        SHIP_MODE_CD: shipModeData.Ship_Mode_Code, // ship_mode
        SHIP_MODE_DESC: shipModeData.SHIP_MODE_DESC,
        DESTINATION_CD: shipModeData.Destination,
        SLT_FLAG: 'N',
        STATUS: 'N',
        UOM_CD,
        CCY_CD,
        TOTAL_ORDER_QTY, // 各种颜色，各种size的总和。
        ORIGINAL_ITEM_LOT_HD_ID: null,
        DROP_ONE_FLAG: '',
        newFlag: true,
      };
      PPO_ITEM_LOT_HD.push(itemLotHdData);


      /** PPO_QCMAININFO */
      if (hasError) {
        break;
      }
      if (qcMainInfo) {
        const PPO_QC_ID = PPO_QCMAININFO.length + 1;
        const itemQcMainInfoData = {
          FULLY_COPY: 'Y',
          PPO_QC_ID,
          PPO_ITEM_ID,
          FABRIC_TYPE_CD,
          FABRIC_CLASS_NAME: 'MAIN BODY', // XXX:???
          QUALITY_CODE,
          SOURCING: qcMainInfo.SOURCING, // helper.setDefault('SOURCING', null, qcMainInfo)
          MATERIAL_GROUP: qcMainInfo.MATERIAL_GROUP,
          TAPPING_TYPE: qcMainInfo.TAPPING_TYPE,
          PATTERN: qcMainInfo.PATTERN,
          DYE_METHOD: qcMainInfo.DYE_METHOD,
          BF_GMMM: qcMainInfo.BF_GMMM,
          AF_GMMM: qcMainInfo.AF_GMMM,
          SHRINKAGE: qcMainInfo.SHRINKAGE,
          SHRINKAGE_TESTING_METHOD: qcMainInfo.SHRINKAGE_TESTING_METHOD,
          GMT_WASHING: qcMainInfo.GMT_WASHING,
          LAYOUT: qcMainInfo.LAYOUT,
          YARN_LENGTH: qcMainInfo.YARN_LENGTH,
          MEASUREMENT: qcMainInfo.MEASUREMENT,
          STATUS: 'N', // XXX:???
          HEAVY_FLAT_KNIT: '', // XXX:???
          SPECIAL_TYPE: qcMainInfo.SPECIAL_TYPE,
          QCStatus: qcMainInfo.STATUS,
          styleIndex: 1, // XXX: ???
          colorwayIndex: 0, // XXX: ???
          garmentPartIndex: 0, // XXX: ???
          newFlag: true, // XXX: ???
        };
        PPO_QCMAININFO.push(itemQcMainInfoData);

        /** PPO_QCFINISHDTL */
        const QCIDEN = qcFinishDtl && qcFinishDtl.IDEN ? qcFinishDtl.IDEN : 0;

        if (masterLnData.Finishing && finishingArray.length > 0) {
          for (const finishIndex in finishingArray) {
            const FINISHING_DESC = finishingArray[finishIndex];
            const finishingData = await this.ctx.service.pbKnitFinish.findByName(FINISHING_DESC);
            if (!finishingData) {
              this.setError(992, `通过"${FINISHING_DESC}"查找Finishing数据失败`, { i: index });
              hasError = true;
              break;
            }
            const itemQcFinishDtl = {
              FULLY_COPY: 'Y',
              IDEN: PPO_QCFINISHDTL.length + 1,
              QCIDEN,
              PPO_QC_ID,
              PPO_ITEM_ID,
              FABRIC_TYPE_CD,
              QUALITY_CODE,
              FINISHING_CODE: finishingData.FINISHING_CODE,
              FINISHING_DESC,
              STATUS: 'N', // XXX:???
              styleIndex: 1, // XXX:???
              colorwayIndex: 0, // XXX:???
              garmentPartIndex: 0, // XXX:???
              finishingIndex: PPO_QCFINISHDTL.length + 1, // XXX:???
              newFlag: true, // XXX:???
            };
            PPO_QCFINISHDTL.push(itemQcFinishDtl);
          }
          if (hasError) {
            break;
          }
        }

        /** PPO_QCCONSTRUCTIONDTL */
        if (constructionData) {
          const itemQcConstructionDtl = {
            FULLY_COPY: 'Y',
            IDEN: PPO_QCCONSTRUCTIONDTL.length + 1,
            QCIDEN,
            PPO_QC_ID,
            PPO_ITEM_ID,
            FABRIC_TYPE_CD,
            QUALITY_CODE,
            CONSTRUCTION: helper.setDefault('CONSTRUCTION', '', constructionData),
            CONSTRUCTION_DESC: helper.setDefault('Fab_Type', '', masterLnData),
            STATUS: 'N',
            styleIndex: 1,
            colorwayIndex: 0,
            garmentPartIndex: 0,
            constructionIndex: PPO_QCCONSTRUCTIONDTL.length + 1,
            newFlag: true,
          };
          PPO_QCCONSTRUCTIONDTL.push(itemQcConstructionDtl);
        }

        /** PPO_QCYARNDTL */
        if (masterLnData.yarnList && masterLnData.yarnList.length > 0) {
          for (const yarnIndex in masterLnData.yarnList) {
            const yarnItem = masterLnData.yarnList[yarnIndex];
            // if (typeof yarnItem === 'undefined' ) {
            //   continue;
            // }
            const itemQcYarnDtl = {
              FULLY_COPY: 'Y',
              IDEN: PPO_QCYARNDTL.length + 1,
              QCIDEN,
              PPO_QC_ID,
              PPO_ITEM_ID,
              FABRIC_TYPE_CD,
              QUALITY_CODE,
              YARN_TYPE: yarnItem.Yarn_Type_Code,
              YARN_TYPE_DESC: yarnItem.Yarn_Type_desc ? yarnItem.Yarn_Type_desc : '',
              YARN_COUNT: yarnItem.Yarn_Count,
              YARN_RATIO: yarnItem.Yarn_Ratio, // TODO: 比例，要截取,
              THREADS: yarnItem.Yarn_Strands ? yarnItem.Yarn_Strands : 1, // XXX:THREADS ????
              WARP_WEFT: '', // XXX: ????
              YARN_DENSITY: '0', // XXX: ????
              STATUS: 'N', // XXX: ????
              styleIndex: 1, // XXX: ????
              colorwayIndex: 0, // XXX: ????
              garmentPartIndex: 0, // XXX: ????
              yarnIndex: PPO_QCYARNDTL.length + 1, // XXX: ????
              newFlag: true,
            };
            PPO_QCYARNDTL.push(itemQcYarnDtl);
          }
        }

      }

    } // End for item loop;

    /** PPO_REV_STIMULATE */
    // PPO_REV_STIMULATE.push({
    //   PPO_NO: '',
    //   PPO_REV_NO: '1',
    //   STIMULATE_ID: '9',
    //   STIMULATE: 'Sales',
    // });

    /** PPO_REV_HIST */
    // PPO_REV_HIST.push({
    //   PPO_NO: '',
    //   PPO_REV_NO: '1',
    //   REV_DATE: today,
    //   REMARKS: '',
    // });

    /** PPO_STYLE */
    PPO_STYLE.push({
      PPO_NO: '',
      FABRIC_NATURE_CD: 'K',
      INFO_TYPE: 'HEADER', // XXX: ???
      PPO_ITEM_ID: 0,
      STYLE_NO,
      CUST_STYLE_NO: CUSTOMER_STYLE_NO,
      CREATE_DATE: today,
      CREATE_USER_ID: username,
      LAST_MODI_DATE: today,
      LAST_MODI_USER_ID: username,
    });

    /** SEND_XML_TRANS */
    // SEND_XML_TRANS.push({
    //   SEQ_NO: '',
    //   PKS: '',
    //   MODULE_INFO: 'PPONEW',
    //   MAIL_TO: 'ESCMADMIN@esquel.com',
    //   FUN_INFO: null,
    //   FACTORY_CD: 'G31200-NEW',
    //   CREATE_DATE: today,
    // });

    if (hasError) {
      return false;
    }

    return {
      PPO_HD,
      PPO_ITEM,
      PPO_ITEM_COMBO,
      PPO_ITEM_COMBO_LABDIP,
      PPO_ITEM_SIZE,
      // FAB_LABDIP_LIB,
      PPO_ITEM_LOT_HD,
      PPO_ITEM_LOT_DT,
      // ...
      PPOX_WASH_TYPE,
      PPO_QCMAININFO,
      PPO_QCFINISHDTL,
      PPO_QCCONSTRUCTIONDTL,
      PPO_QCYARNDTL,
      PPO_REV_STIMULATE,
      PPO_REV_HIST,
      PPO_STYLE,
      // ...
      QCMAININFO,
      QCFINISHDTL,
      QCCONSTRUCTIONDTL,
      QCYARNDTL,
      QCCUSTOMERLIBRARY,
      PPOX_ATTACHMENT,
      SEND_XML_TRANS,
    };

  }


  /**
   * 通过excel导入的season字段数据，取得年分和季节码等信息
   * @param {String} season 从excel表导入的seasonn字段数据
   */
  async getSeasonData(season) {
    season = season.toLowerCase();
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
    let year = '';
    let season_code = '';
    if (season.indexOf('-') > 0) {
      const seasonSplit = season.split('-');
      if (typeof seasonSplit[2] === 'undefined' || typeof seasonSplit[3] === 'undefined') {
        return false;
      }
      year = '20' + seasonSplit[2];
      const seasonIndex = parseInt(seasonSplit[3]);
      season_code = seasonCodes['q' + seasonIndex];

    } else if (season.indexOf('q')) {
      const seasonSplit = season.split('q');
      year = '20' + seasonSplit[0];
      const seasonIndex = typeof seasonSplit[1] !== 'undefined' ? seasonSplit[1] : false;
      if (!seasonIndex || typeof seasonCodes['q' + seasonIndex] === 'undefined') {
        return false;
      }
      season_code = seasonCodes['q' + seasonIndex];
    } else {
      return false;
    }
    return {
      season: season_code,
      year,
    };
  }

  formatGarmentComponent(str) {
    return str.substring(1, str.length).trim();
  }

  formatColor(str) {
    let color_code = '';
    let color_name = '';
    const colorSplit = str.split(' ');
    color_code = colorSplit[0];
    const colorNameStr = _.isString(colorSplit[1]) ? colorSplit[1] : '';
    const colorNameSplit = colorNameStr.split('-');
    color_name = colorNameSplit[0];
    return {
      color_code, color_name,
    };
  }

}

module.exports = SppoJsonService;
