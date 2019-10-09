'use strict';
const helper = require('../extend/helper');
module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const MasterShipMode = app.model.define('Master_ShipMode',
    {
      Customer_Code: INTEGER,
      Ship_Mode: STRING(20),
      Destination: STRING(10),
      Ship_Mode_Code: STRING(20),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );
  MasterShipMode.removeAttribute('id');

  // 通过Customer_Code查ShipMode
  MasterShipMode.getShipModeByCC = async function(Customer_Code, exp = 60 * 5) {
    const cacheKey = 'm1:master_shipMode:ccd_' + Customer_Code;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: { Customer_Code },
      order: [
        [ 'Ship_Mode', 'DESC' ],
      ],
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterShipMode;
};
