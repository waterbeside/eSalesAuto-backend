'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const MasterSize = app.model.define('Master_Size', {
      Customer_Code: INTEGER,
      Size: STRING(10),
      Sort: INTEGER,
    },
    {freezeTableName: true,
      timestamps: false, 
    }
  );
  MasterSize.removeAttribute('id');


  MasterSize.getByCustomerCode  = async function(Customer_Code) {
    const Op = app.Sequelize.Op;
    return await this.findAll({
      where: { 
        Customer_Code,
      },
      order:[['Sort','ASC']]
    });
  };

 

  return MasterSize;
};
