'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const MasterQtyLD = app.model.define('Master_Qty_LD',
    {
      Garment_Part: STRING(3),
      Qty: INTEGER,
      LD_STD: STRING(20),
      Garment_Part_Desc: STRING(10),
      Garment_Part_CD: STRING(2),
      Sized: STRING(2),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );
  MasterQtyLD.removeAttribute('id');
  return MasterQtyLD;

};
