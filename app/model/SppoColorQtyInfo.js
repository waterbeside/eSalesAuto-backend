'use strict';
/** 
 * SPPO_Color_Qty_Info (颜色数量信息)
 */
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoColorQtyInfo = app.model.define('SPPO_Color_Qty_Info', {
    ID: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    PPO_ID:STRING(20),
    Garment_Part:STRING(3),
    Customer_Fab_Code: STRING(50),
    Color_Combo : STRING(50),
    Fabric_Code_ESCM : STRING(50),
    Qty  : INTEGER,
    LD_STD : STRING(20),
     
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
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );

  return SppoColorQtyInfo;
};
