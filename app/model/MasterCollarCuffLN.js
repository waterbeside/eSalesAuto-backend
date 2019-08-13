'use strict';
/**
 * Master_Collar_Cuff_LN (领袖具体信息)
 */

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoCollarCuff = app.model.define('Master_Collar_Cuff_LN',
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
      Dye_Method: STRING(20),
      Yarn_Count: STRING(50),
      Yarn_Strands: STRING(10),
      Yarn_Ratio: STRING(50),
      Yarn_Type: STRING(100),
      CC_Desc: STRING(1000),
      CC_Remark: STRING(100),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  return SppoCollarCuff;
};
