'use strict';
/**
 * SPPO_Fabrication(面料具体信息)
 */

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const SppoFabrication = app.model.define('SPPO_Fabrication',
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
      // PPO_NO:STRING(20),
      PPO_ID: STRING(20),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  return SppoFabrication;
};
