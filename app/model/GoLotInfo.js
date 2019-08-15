'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const GoLotInfo = app.model.define('GO_Lot_Info',
    {
      GO_ID: STRING(20),
      LOT_NO: INTEGER,
      JO_NO: STRING(20),
      BPO_NO: STRING(20),
      BPO_Date: DATE,
      PPC_Date: DATE,
      Warehouse: STRING(20),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );

  GoLotInfo.removeAttribute('id');


  return GoLotInfo;
};
