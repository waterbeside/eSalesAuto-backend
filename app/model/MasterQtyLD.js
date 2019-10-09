'use strict';
const helper = require('../extend/helper');
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


  MasterQtyLD.findByGP = async function(Garment_Part, exp = 60 * 5) {
    const cacheKey = 'm1:master_qty_ld:gp_' + Garment_Part;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: { Garment_Part },
      order: [
        [ 'Garment_Part', 'DESC' ],
      ],
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterQtyLD;

};
