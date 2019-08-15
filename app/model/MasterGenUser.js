'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const MasterGenUser = app.model.define('Master_Gen_User',
    {
      ID: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      User_ID: STRING(10),
      Sales_Team: STRING(5),
      Customer_Code: INTEGER,
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );


  // 通过id查数据
  MasterGenUser.findByUserID = async function(username) {
    return await this.findAll({
      where: { User_ID: username },
      order: [
        [ 'Customer_Code', 'ASC' ],
      ],
    });
  };

  // 通过id查数据
  MasterGenUser.findCustomCodeByUserID = async function(username) {
    const res = await this.findByUserID(username);
    const returnData = [];
    res.forEach(element => {
      returnData.push(element.Customer_Code);
    });
    return returnData;
  };


  return MasterGenUser;
};
