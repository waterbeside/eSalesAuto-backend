'use strict';
/**
 * Master_Fabrication_LN (面料具体信息)
 */
const moment = require('moment');
const helper = require('../extend/helper');
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const MasterFabricationLN = app.model.define('Master_Fabrication_LN',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Customer_Fab_Code: STRING(50),
      Refer_PPO_Usage: STRING(20),
      Fab_Type: STRING(50),
      Fab_Pattern: STRING(50),
      Fab_Width: STRING(10),
      Finishing: STRING(300),
      Dye_Method: STRING(20),
      Weight_BW: INTEGER,
      Weight_AW: INTEGER,
      Shrinkage: STRING(10),
      Shrinkage_Test_Method: STRING(20),
      Yarn_Count: STRING(50),
      Yarn_Strands: STRING(10),
      Yarn_Ratio: STRING(300),
      Yarn_Type: STRING(300),
      Fab_Desc: STRING(1000),
      Fab_Remark: STRING(100),
      Create_Time: {
        type: DATE,
        get() {
          return moment(moment(this.getDataValue('Create_Time')).utc().format('YYYY-MM-DD HH:mm:ss'));
        },
      },
      Update_Time: {
        type: DATE,
        get() {
          return moment(moment(this.getDataValue('Update_Time')).utc().format('YYYY-MM-DD HH:mm:ss'));
        },
      },
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  /**
   * 通过用Customer_Fab_Code查数据
   * @param {String} cfcd Customer_Fab_Code
   * @param {Integer} exp 缓存时间
   */
  MasterFabricationLN.findByCfcd = async function(cfcd, exp = 1800) {
    const cacheKey = 'm1:master_fabrication_ln:cfcd_' + cfcd;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: {
        Customer_Fab_Code: cfcd,
      },
      raw: true,
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  /**
   * 检验Customer_Fab_Code唯一
   * @param {String} Customer_Fab_Code 用户名
   * @param {Integer} exclude_id 排除id
   */
  MasterFabricationLN.checkUnique = async function(Customer_Fab_Code, exclude_id) {
    const Op = app.Sequelize.Op;
    const where = {
      Customer_Fab_Code,
    };
    if (exclude_id) {
      where.id = {
        [Op.ne]: exclude_id,
      };
    }
    const cnt = await this.count({ where });
    if (cnt > 0) {
      return false;
    }
    return true;


  };

  return MasterFabricationLN;
};
