'use strict';

module.exports = app => {
  const { INTEGER } = app.Sequelize;

  const MasterShipMode = app.model.define('Master_ShipMode',
    {
      Customer_Code: INTEGER,
      Ship_Mode: INTEGER,
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );
  MasterShipMode.removeAttribute('id');

  // 通过Customer_Code查ShipMode
  MasterShipMode.getShipModeByCC = async function(Customer_Code) {
    const res = await this.findOne({
      where: { Customer_Code },
      order: [
        [ 'Ship_Mode', 'DESC' ],
      ],
    });
    if (!res) {
      return false;
    }
    return res.Ship_Mode;
  };

  return MasterShipMode;
};
