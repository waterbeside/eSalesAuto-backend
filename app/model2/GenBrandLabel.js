'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const GenBrandLabel = app.model2.define('GEN_BRAND_LABEL', {
      CUSTOMER_CD: STRING(10),
      BRAND_CD: STRING(4),
      LABEL_CD: STRING(20),
      SEQ: INTEGER(38),
      LABEL_DESC: STRING(200),
      ACTIVE: STRING(1),
      CREATE_USER_ID: STRING(20),
      CREATE_DATE: DATE,
      LAST_MODI_USER_ID: STRING(20),
      LAST_MODI_DATE: DATE,
    },
    {freezeTableName: true,
      timestamps: false, 
    }
  );



  return GenBrandLabel;
};
