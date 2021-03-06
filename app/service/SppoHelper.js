'use strict';

const moment = require('moment');
const _ = require('lodash');
const BaseService = require('./Base');
// const Service = require('egg').Service;
class SppoHelperService extends BaseService {

  // 取得Unit数据
  async getUnitByGP(garment_part) {
    const { ctx } = this;
    const cacheKey = 'sppo:master_unit:garmentPart_' + garment_part;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const Unit = await ctx.model.MasterUnit.getUnitByGP(garment_part);
    if (Unit) {
      await ctx.helper.setStoreData(cacheKey, Unit, 60 * 5);
      return Unit;
    }
    return '';
  }

  // 2）
  async getSppoGpDelDesData(Garment_Part, PPO_ID) {
    const { ctx } = this;

    const cacheKey = 'sppo:sppo_gp_del_des:ppoId_' + PPO_ID + '_garmentPart_' + Garment_Part;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    // let cacheData = await this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoGpDelDestinationInfo.findOne({
      where: {
        PPO_ID,
        Garment_Part,
      },
    });
    if (res) {
      await ctx.helper.setStoreData(cacheKey, res, 60);
    }
    return res;
  }

  // 5)
  async getMasterQtyData(Garment_Part) {
    const { ctx } = this;

    const cacheKey = 'sppo:master_qty:garmentPart_' + Garment_Part;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.model.MasterQtyLD.findOne({
      where: {
        Garment_Part,
      },
      order: [
        [ 'Garment_Part', 'DESC' ],
      ],
    });
    await ctx.helper.setStoreData(cacheKey, res, 60);
    return res;

  }

  // 5 getSppoColorQtyData
  async getSppoColorQtyData(Garment_Part, PPO_ID) {
    const { ctx } = this;

    const cacheKey = 'sppo:sppo_color_qty:ppoId_' + PPO_ID + '_garmentPart_' + Garment_Part;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.model.SppoColorQtyInfo.findOne({
      where: {
        PPO_ID,
        Garment_Part,
      },
    });
    if (res) {
      await ctx.helper.setStoreData(cacheKey, res, 60);
    }
    return res;

  }


  // 3）
  async getMasterFabDataByFC(Customer_Fab_Code) {
    const { ctx } = this;

    const cacheKey = 'sppo:master_fab:cfc_' + Customer_Fab_Code;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      console.log('masterFabCache');
      return cacheData;
    }
    const res = await ctx.model.MasterFabricationLN.findOne({
      where: {
        Customer_Fab_Code,
      },
    });
    await ctx.helper.setStoreData(cacheKey, res, 60);
    return res;
  }

  // 3）
  async getSppoFabData(Customer_Fab_Code, PPO_ID) {
    const { ctx } = this;

    const cacheKey = 'sppo:sppo_fab:cfc_' + Customer_Fab_Code + '_sppoID_' + PPO_ID;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      console.log('fabCache');
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoFabrication.findOne({
      where: {
        Customer_Fab_Code,
        PPO_ID,
      },
    });
    if (res) {
      await ctx.helper.setStoreData(cacheKey, res, 60);
    }
    return res;
  }

  // 4）
  async getMasterCollarCuffDataByFC(Customer_Fab_Code) {
    const { ctx } = this;

    const cacheKey = 'sppo:master_collar_cuff:cfc_' + Customer_Fab_Code;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      console.log('masterFabCache');
      return cacheData;
    }
    const res = await ctx.model.MasterCollarCuffLN.findOne({
      where: {
        Customer_Fab_Code,
      },
    });
    await ctx.helper.setStoreData(cacheKey, res, 60);
    return res;
  }

  // 4）
  async getSppoCollarCuffData(Customer_Fab_Code, PPO_ID) {
    const { ctx } = this;

    const cacheKey = 'sppo:sppo_collar_cuff:cfc_' + Customer_Fab_Code + '_sppoID_' + PPO_ID;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      console.log('fabCache');
      return cacheData;
    }
    // let cacheData = await this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoCollarCuff.findOne({
      where: {
        Customer_Fab_Code,
        PPO_ID,
      },
    });
    if (res) {
      await ctx.helper.setStoreData(cacheKey, res, 60);
    }
    return res;
  }

  // get sppoDetail
  async getDetail(ppo_no) {
    const { ctx } = this;

    const data = {};
    data.sppoTitle = await ctx.model.SppoTitle.findOne({
      where: {
        PPO_NO: ppo_no,
        Is_Active: 1,
      },
      order: [
        [ 'Rev_NO', 'DESC' ],
      ],
    });
    if (!data.sppoTitle) {
      return null;
    }
    const PPO_ID = data.sppoTitle.PPO_ID;
    // const PPO_NO = data.sppoTitle.PPO_NO;
    data.sppoTitle.setDataValue('Create_Time', moment(data.sppoTitle.Create_Time).valueOf());
    data.sppoTitle.setDataValue('Update_Time', moment(data.sppoTitle.Update_Time).valueOf());

    data.sppoGpDelDest = await ctx.model.SppoGpDelDestinationInfo.findAll({
      where: {
        PPO_ID,
      },
    });

    data.sppoColorQty = await ctx.model.SppoColorQtyInfo.findAll({
      where: {
        PPO_ID,
      },
    });

    data.sppoFabrication = await ctx.model.SppoFabrication.findAll({
      where: {
        PPO_ID,
      },
    });

    data.sppoCollarCuff = await ctx.model.SppoCollarCuff.findAll({
      where: {
        PPO_ID,
      },
    });

    // data.itemList = [];
    // data.sppoGpDelDest.forEach((item,index)=>{
    //   let newItem = {};
    //   newItem.sppoGpDelDest = item;
    //   newItem.sppoColorQty =_.filter(data.sppoColorQty,{PPO_ID,Garment_Part:item.Garment_Part});
    //   newItem.sppoFabrication =_.filter(data.sppoFabrication,{PPO_NO,Customer_Fab_Code:item.Customer_Fab_Code});
    //   newItem.sppoCollarCuff =_.filter(data.sppoCollarCuff,{PPO_ID,Customer_Fab_Code:item.Customer_Fab_Code});
    //   data.itemList.push(newItem);
    // })
    return data;
    // return this.jsonReturn(0,data,'success');
  }


  /**
   * 生成PPO_NO前部分
   * @param {string} username 用户名
   */
  async buildBasePpoNo(username) {
    const { ctx } = this;
    const cacheKey = 'sppo:basePpoNo:user_' + username;
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return cacheData;
    }
    const res = await ctx.service.genUsers.getDepartmentIdByUsername(username);
    if (!res) {
      return false;
    }
    const sales_team = res.DEPARTMENT_ID;
    const sales_team_code = sales_team.substring(0, 1);
    const year_no = moment().format('YY');
    const basePpoNo = 'KSF' + year_no + sales_team_code + sales_team;
    await ctx.helper.setStoreData(cacheKey, basePpoNo, 60);
    return basePpoNo;

  }


  /**
   * 创建一个 PPO_NO
   */
  async buildPpoNo() {
    const { ctx } = this;
    const res = await ctx.model.SppoTitle.buildSerialNo();
    if (!res) {
      return false;
    }
    const SerialNo = ctx.helper.prefixO(res, 5);
    const basePpoNo = await this.buildBasePpoNo();
    return basePpoNo + SerialNo;
  }


  // 验证重复的 Garment_Part Customer_Fab_Code;
  check_gp_cfc_same(dataList) {
    const { ctx } = this;

    let hasError = 0;
    this.errorData = typeof (this.errorData) !== 'undefined' ? this.errorData : {};
    this.errorData.errorIndex = [];
    const list = dataList.map(el => {
      return ctx.helper.changeCaseJsonKey(Object.assign({}, el));
    });
    for (const i in list) {
      const row = list[i];
      const garment_part = row.garment_part;
      const customer_fab_code = row.customer_fab_code;
      const otherdRowIndex = list.findIndex((item, index) => {
        // console.log('i:index=' + i + ':' + index);
        // console.log('garment_part=' + garment_part + ':' + item.garment_part);
        // console.log('customer_fab_code=' + customer_fab_code + ':' + item.customer_fab_code);
        return (_.trim(item.garment_part) === _.trim(garment_part) && _.trim(item.customer_fab_code) !== customer_fab_code && i !== index);
      });
      if (otherdRowIndex !== -1) {
        hasError = 1;
        this.errorData.errorIndex.push(parseInt(i), otherdRowIndex);
        break;
      }
    }
    return !hasError;
  }

  // ****************************** V2 ******************************


  async findMstFabAndCcByCfcAndGP(customer_fab_code, garment_part) {
    const helper = this.ctx.helper;
    const returnData = {
      masterFabData: {
        ID: 0,
        Customer_Fab_Code: '',
        Refer_PPO_Usage: '',
        Fab_Type: '',
        Fab_Pattern: '',
        Fab_Width: '',
        Finishing: '',
        Dye_Method: '',
        Weight_BW: 0,
        Weight_AW: 0,
        Yarn_Count: '',
        Yarn_Strands: '',
        Yarn_Ratio: 0,
        Yarn_Type: '',
        Fab_Desc: '',
        Fab_Remark: '',
      },
      masterCollarCuffData: {
        ID: 0,
        Customer_Fab_Code: '',
        Refer_PPO_Usage: '',
        CC_Type: '',
        Size: '',
        Finishing: '',
        Dye_Method: '',
        Yarn_Count: '',
        Yarn_Strands: '',
        Yarn_Ratio: 0,
        Yarn_Type: '',
        CC_Desc: '',
        CC_Remark: '',
      },
    };
    if ([ 'O', 'C' ].includes(garment_part)) {
      const masterCollarCuffData = await this.ctx.model.MasterCollarCuffLN.findByCfcd(customer_fab_code);
      returnData.masterCollarCuffData = masterCollarCuffData;
      returnData.mergData = Object.assign({}, returnData.masterFabData, masterCollarCuffData);
    } else {
      const masterFabData = await this.ctx.model.MasterFabricationLN.findByCfcd(customer_fab_code);
      returnData.masterFabData = masterFabData;
      returnData.mergData = Object.assign({}, returnData.masterCollarCuffData, masterFabData);
    }
    const mergData = returnData.mergData;
    const yarnTypeArray = String(mergData.Yarn_Type).split(',');
    const yarnCountArray = String(mergData.Yarn_Count).split(',');
    mergData.Yarn_Ratio = String(mergData.Yarn_Ratio).replace(/\//g, ',');
    const yarnRatioArray = String(mergData.Yarn_Ratio).split(',');
    const yarnStrandsArray = String(mergData.Yarn_Strands).split(',');

    const yarnList = [];
    for (const yarnTypeIndex in yarnTypeArray) {
      const Yarn_Type_desc = yarnTypeArray[yarnTypeIndex];
      const Yarn_Count = helper.setDefault(yarnTypeIndex, '', yarnCountArray);
      const Yarn_Ratio_str = helper.setDefault(yarnTypeIndex, '', yarnRatioArray);
      const Yarn_Ratio = this.parseYarnRatio(Yarn_Ratio_str);
      const Yarn_Strands = helper.setDefault(yarnTypeIndex, '', yarnStrandsArray);
      const yarnTypeData = await this.ctx.service.pbKnitYarnType.findByDesc(Yarn_Type_desc);
      const Yarn_Type_Code = yarnTypeData && yarnTypeData.YARN_TYPE ? yarnTypeData.YARN_TYPE : '';


      const yarnItemData = {
        yarnTypeData,
        Yarn_Type_desc,
        Yarn_Count,
        Yarn_Ratio,
        Yarn_Ratio_str,
        Yarn_Strands,
        Yarn_Type_Code,
      };
      // console.log(yarnItemData);
      yarnList.push(yarnItemData);
    }
    returnData.mergData.yarnList = yarnList;

    return returnData;
  }

  /**
   * 解析YarnRatio字段字符串到百分比小数
   * @param {String} str YarnRatio字段字符串内容
   */
  parseYarnRatio(str) {
    if (!str) {
      return 0;
    }
    const strSplit = str.split('%');
    const str2 = strSplit[0];
    let num = str2;
    if (str2.indexOf(':') > -1) {
      const strSplit2 = str2.split(':');
      num = typeof strSplit2[1] === 'undefined' ? strSplit2[0] : strSplit2[1];
    }
    return parseFloat(num) / 100;
  }

  /**
   * 从过往的PPO_ITEM，通过PPO_NO、FABRIC_TYPE_CD，查出QUALITY_CODE
   *
   * @param {string} PPO_NO PPO_NO
   * @param {string} FABRIC_TYPE_CD FABRIC_TYPE_CD
   * @param {number} exp 缓存时间
   */
  async getQualityCodeByPpoFcd(PPO_NO, FABRIC_TYPE_CD, exp) {
    const cacheKey = 'escm:PPO_ITEM:PPO_' + PPO_NO + '_FTC_' + FABRIC_TYPE_CD;
    const cacheData = await this.ctx.helper.cache(cacheKey);
    if (cacheData) {
      return cacheData.QUALITY_CODE;
    }
    const sql = `select * from ESCMOWNER.PPO_ITEM where PPO_NO = '${PPO_NO}' and FABRIC_TYPE_CD = '${FABRIC_TYPE_CD}'`;
    const res = await this.query('oracle', sql, 1);
    if (res && res.QUALITY_CODE && typeof (exp) === 'number' && exp > -1) {
      await this.ctx.helper.cache(cacheKey, res, exp);
    }
    return res ? res.QUALITY_CODE : null;
  }

}

module.exports = SppoHelperService;
