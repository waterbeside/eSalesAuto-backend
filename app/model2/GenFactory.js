'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const GenFactory = app.model2.define('GEN_FACTORY', {
    FACTORY_ID: {
      type: STRING(10),
      primaryKey: true,
    },
    ENG_NAME: STRING(200),
    CHN_NAME: STRING(100),
    ABBREVIATION: STRING(30),
    ADDRESS: STRING(100),
    CHIEF: STRING(30),
    TELEPHONE_NO: STRING(30),
    FAX_NO: STRING(30),
    EMAIL: STRING(100),
    HOMEPAGE: STRING(100),
    CONNECT_PERSION: STRING(30),
    CREATE_USER_ID: STRING(20),
    CREATE_DATE: DATE,
    REMARK: STRING(200),
    ACTIVE: STRING(1),
    INTERNAL_FLAG: STRING(1),
    CHINA_FLAG: STRING(1),
    COA_ENTITY_CD: STRING(3),
    COUNTRY_CD: STRING(10),
    OPA_FLAG: STRING(1),
    RELEVANT_SUPP_CD: STRING(10),
    RELEVANT_SUPP_SITE_CODE: STRING(10),
    FTY_ID_FOR_GO: STRING(1),
    BILL_TO_DESC: STRING(500),
    LETTERHEAD_URL: STRING(100),
    DEFAULT_SHIP_MODE_CD: STRING(2),
    OU: STRING(10),
    LAST_MODIFY_DATE: DATE,
    LAST_UPDATE_DATE_FOR_ESB: DATE,

  },
  { freezeTableName: true,
    timestamps: false,
    schema: 'escmowner',
    tableName: 'GEN_FACTORY',
  }
  );
  // GenFactory.removeAttribute('id');


  return GenFactory;
};
