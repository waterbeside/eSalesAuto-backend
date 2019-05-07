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
    LD_STD : STRING(20)
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );

  return SppoColorQtyInfo;
};
