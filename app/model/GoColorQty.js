'use strict';
const moment = require('moment');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const GoColorQty = app.model.define('GO_Color_Qty', {
    JO_NO: STRING(20),
    Color_Combo: STRING(20),
    Color_Code:STRING(2),
    Size:STRING(10),
    Qty:INTEGER,
    GO_ID:STRING(20),
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );

 GoColorQty.removeAttribute('id');





  return GoColorQty;
};
