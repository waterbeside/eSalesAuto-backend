'use strict';

const moment = require('moment');
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const MasterLeadTime = app.model.define('Master_leadTime', {
      Customer_Code:INTEGER,
      Lead_Time:INTEGER,
    },
    {freezeTableName: true,
      timestamps: false, 
    }
  );
  MasterLeadTime.removeAttribute('id');

  //通过Customer_Code查LeadTime
  MasterLeadTime.getLeadTimeByCC = async function(Customer_Code){
    let res =  await this.findOne({
      where: { Customer_Code },
      order : [
        ['Lead_Time', 'DESC'],
      ]
    });
    if(!res){
      return false;
    }
    return res.Lead_Time;
  };

  //取得交期
  MasterLeadTime.getDeliveryByCC = async function(Customer_Code){
    let res =  await this.getLeadTimeByCC(Customer_Code);
    res = res ? parseInt(res) : 15;
    return moment().add(res, 'd').format('YYYY-MM-DD');
  };

  

  return MasterLeadTime;
};
