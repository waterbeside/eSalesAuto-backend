'use strict';

const moment = require('moment');
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const MasterUnit = app.model.define('Master_Unit', {
      Garment_Part:STRING(3),
      Unit:STRING(5),
    },
    {freezeTableName: true,
      timestamps: false, 
    }
  );
  MasterUnit.removeAttribute('id');

  //通过Customer_Code查ShipMode
  MasterUnit.getUnitByGP = async function(Garment_Part){
    let res =  await this.findOne({
      where: { Garment_Part },
      order : [
        ['Unit', 'DESC'],
      ]
    });
    if(!res){
      return false;
    }
    return res.Unit;
  };

  return MasterUnit;
};
