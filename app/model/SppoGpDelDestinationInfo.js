'use strict';
/**
 * SPPO Garment Part, 客户面料Code，Delivery，Destination信息
 */

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoGpDelDestinationInfo = app.model.define('SPPO_GP_Del_Destination_Info',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      PPO_ID: STRING(20),
      Garment_Part: STRING(3),
      Customer_Fab_Code: STRING(50),
      Delivery: DATE,
      Destination: STRING(5),
      Ship_Mode: STRING(20),
      Unit: STRING(5),
      Remark: STRING(1000),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  return SppoGpDelDestinationInfo;
};
