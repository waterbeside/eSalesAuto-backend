'use strict';
/**
 * MasterColorCombo (颜色信息)
 */

const helper = require('../extend/helper');
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const MasterColorCombo = app.model.define('Master_Color_Combo',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Customer_Code: INTEGER,
      Lab_Dip_Color_Name: STRING(50),
      Lab_Dip_Req: STRING(20),
      Mill_Color_Code: STRING(20),
      Shade: STRING(5),
      Remark: STRING(100),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  /**
   * 通过用 Customer_Code 和 Color_Name 查数据
   * @param {String} Customer_Code Customer_Code
   * @param {String} Color_Name Color_Name
   * @param {Integer} exp 缓存时间
   */
  MasterColorCombo.findByCustomerAndColor = async function(Customer_Code, Color_Name, exp = 60 * 10) {
    const cacheKey = 'm1:master_color_combo:ccd_' + Customer_Code + '_color_' + Color_Name;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: {
        Customer_Code,
        Lab_Dip_Color_Name: Color_Name,
      },
      raw: true,
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterColorCombo;
};
