'use strict';
/**
 * Master_Collar_Cuff_LN (领袖具体信息)
 */
const helper = require('../extend/helper');
module.exports = app => {
  const { STRING, INTEGER, FLOAT } = app.Sequelize;

  const MasterCollarCuffSize = app.model.define('Master_Collar_Cuff_Size',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Customer_Code: INTEGER,
      Size: STRING(10),
      Dimension: STRING(30),
      L_Int: INTEGER,
      L_Fra: FLOAT,
      H_Int: INTEGER,
      H_Fra: FLOAT,
      UOM: STRING(10),
      Sex: STRING(2),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  // 通过id查数据
  MasterCollarCuffSize.findUomByCcd = async function(ccd) {
    const res = await this.findOne({
      where: {
        Customer_Code: ccd,
      },
    });
    return res;
  };

  // 通过Customer_code查列表
  MasterCollarCuffSize.findAllByCcd = async function(ccd, exp = 30) {
    const cacheKey = 'm1:master_collar_cuff_size:ccd_' + ccd;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findAll({
      where: {
        Customer_Code: ccd,
      },
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterCollarCuffSize;
};
