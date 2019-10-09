'use strict';
/**
 * Master_Collar_Cuff_LN (领袖具体信息)
 */
const helper = require('../extend/helper');
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const MasterCollarCuffLN = app.model.define('Master_Collar_Cuff_LN',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Customer_Fab_Code: STRING(50),
      Refer_PPO_Usage: STRING(20),
      CC_Type: STRING(50),
      CC_Pattern: STRING(10),
      Size: STRING(10),
      Finishing: STRING(50),
      Finishing_Code: STRING(10),
      Dye_Method: STRING(20),
      Yarn_Count: STRING(50),
      Yarn_Strands: STRING(10),
      Yarn_Ratio: STRING(50),
      Yarn_Type: STRING(100),
      Yarn_Type_Code: STRING(10),
      CC_Desc: STRING(1000),
      CC_Remark: STRING(100),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  /**
   * 通过Customer_Fab_Code 查数据
   * @param {String} Customer_Fab_Code Customer_Fab_Code
   * @param {Integer} exp 缓存时间
   */
  MasterCollarCuffLN.findByCfcd = async function(Customer_Fab_Code, exp = 1800) {
    const cacheKey = 'm1:master_collar_cuff_ln:cfcd_' + Customer_Fab_Code;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: {
        Customer_Fab_Code,
      },
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterCollarCuffLN;
};
