'use strict';

const helper = require('../extend/helper');
module.exports = app => {
  const { STRING } = app.Sequelize;

  const MasterUnit = app.model.define('Master_Unit',
    {
      Garment_Part: STRING(3),
      Unit: STRING(5),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );
  MasterUnit.removeAttribute('id');

  /**
   * 通过Customer_Code查ShipMode
   * @param {string} Garment_Part Garment_Part
   * @param {integer} exp 缓存的有效时间
   */
  MasterUnit.getUnitByGP = async function(Garment_Part, exp = 60 * 5) {
    const cacheKey = 'm1:master_unit:gp_' + Garment_Part;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData.Unit;
      }
    }
    const res = await this.findOne({
      where: { Garment_Part },
      order: [
        [ 'Unit', 'DESC' ],
      ],
    });

    if (!res) {
      return null;
    }
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res.Unit;
  };

  return MasterUnit;
};
