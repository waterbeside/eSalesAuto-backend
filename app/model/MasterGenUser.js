'use strict';

const helper = require('../extend/helper');
module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const MasterGenUser = app.model.define('Master_Gen_User', {
    ID: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    User_ID: STRING(10),
    Sales_Team: STRING(5),
    Customer_Code: INTEGER,
    Customer_Name: STRING(100),
    Sales_Name: STRING(50),
    Attention_To: STRING(1000),
    Buyer_Group: STRING(1),
    Ship_Tolerance: STRING(1000),
    Swatch_Req: STRING(300),
    A4_Receiver: STRING(30),
    Sub_Dept: STRING(30),
    Need_Matching_Thread: STRING(1),
    Over_Ship_Tolerance: INTEGER(1),
    Short_Ship_Tolerance: INTEGER(1),
    Sales_NT: STRING(20),
  }, {
    freezeTableName: true,
    timestamps: false,
  });


  // 通过id查数据
  MasterGenUser.findByUserID = async function(username) {
    return await this.findAll({
      where: {
        User_ID: username,
      },
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

  /**
   * 通过用户名和客户码查找数据
   * @param {String} user 用户名
   * @param {String} ccd 客户码
   * @param {Integer} exp 缓存时间
   */
  MasterGenUser.findDataByUserCcd = async function(user, ccd, exp = 1800) {
    const cacheKey = 'm1:master_gen_user:u_' + user + '_ccd_' + ccd;
    if (typeof (exp) === 'number' && exp > -1) {
      const cacheData = await helper.cache({ app }).run(cacheKey);
      if (cacheData) {
        return cacheData;
      }
    }
    const res = await this.findOne({
      where: {
        User_ID: user,
        Customer_Code: ccd,
      },
      order: [
        [ 'Customer_Code', 'ASC' ],
      ],
      raw: true,
    });
    if (res && typeof (exp) === 'number' && exp > -1) {
      await helper.cache({ app }).run(cacheKey, res, exp);
    }
    return res;
  };

  return MasterGenUser;
};
