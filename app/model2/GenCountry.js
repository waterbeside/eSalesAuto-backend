'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const GenCountry = app.model2.define('GEN_COUNTRY', {
    COUNTRY_CD: {
      type: STRING(10),
      primaryKey: true,
    },
    NAME: STRING(50),
    MARKET_CD: STRING(10),
    NAME_CHN: INTEGER(100),
    ACTIVE: STRING(1),
  },
  { freezeTableName: true,
    timestamps: false,
    schema: 'escmowner',
    tableName: 'GEN_COUNTRY',
  }
  );
  // GenCountry.removeAttribute('id');

  return GenCountry;
};
