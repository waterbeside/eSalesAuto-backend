'use strict';
/** 
 * SPPO_Collar_Cuff (领袖具体信息)
 */
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoCollarCuff = app.model.define('SPPO_Collar_Cuff', {
    ID: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Customer_Fab_Code: STRING(50),
    Refer_PPO_Usage: STRING(20),
    CC_Type: STRING(50),
    CC_Pattern: STRING(10),
    Size:STRING(10),
    Finishing:STRING(50),
    Dye_Method:STRING(20),
    Yarn_Count:STRING(50),
    Yarn_Strands:STRING(10),
    Yarn_Ratio:STRING(50),
    Yarn_Type:STRING(100),
    CC_Desc:STRING(1000),
    CC_Remark:STRING(100),
    PPO_NO:STRING(20),
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );

  return SppoCollarCuff;
};
