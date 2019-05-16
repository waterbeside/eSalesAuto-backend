'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const MasterGoMarket = app.model.define('Master_GO_Market', {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Warehouse: STRING(20),
      Over_Ship: INTEGER,
      Short_Ship: INTEGER,
      BPO_Del_Term: STRING(20),
      Trade_Term: STRING(20),
      Payment_Term: STRING(100),
      Market_Quota: STRING(20),
      Country_City: STRING(50),
      Ship_Mode: STRING(10),

    },
    {freezeTableName: true,
      timestamps: false, 
    }
  );

  MasterGoMarket.getOneByWarehouse  = async function(Warehouse) {
    const Op = app.Sequelize.Op;
    return await this.findOne({
      where: { 
        Warehouse,
      },
    });
  };
  

  return MasterGoMarket;
};
