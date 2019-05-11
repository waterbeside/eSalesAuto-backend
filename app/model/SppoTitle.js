'use strict';
const moment = require('moment');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoTitle = app.model.define('SPPO_Title', {
    ID: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Creater: STRING(10),
    Create_Time: {
      type:DATE,
      get (){
        return moment(moment(this.getDataValue('Create_Time')).utc().format('YYYY-MM-DD HH:mm:ss'));
      }
    },
    PPO_NO: STRING(20),
    Last_Updater:STRING(10),
    Update_Time: {
      type:DATE,
      get (){
        return moment(moment(this.getDataValue('Create_Time')).utc().format('YYYY-MM-DD HH:mm:ss'));
      }
    },
    Rev_NO:INTEGER,
    PPO_ID:STRING(20),
    Style_No:STRING(20),
    Season:STRING(10),
    Garment_Wash:STRING(20),
    Is_Active: INTEGER,
    Customer_Code: INTEGER,
    Brand : STRING(5),
    Serial_NO: INTEGER,
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );


  //通过id查数据
  SppoTitle.findById = async function(id) {
    return await this.findOne({
      where: { ID:id },
    });
  };

  //通过PPO_NO查数据
  SppoTitle.findByPpoNo = async function(PPO_NO) {
    const Op = app.Sequelize.Op;
    return await this.findOne({
      where: { 
        PPO_NO:PPO_NO,
        Is_Active:{
          [Op.gt]: 0
        },
      },
    });
  };

  //通过Style_NO查数据
  SppoTitle.findByStyleNo = async function(Style_No,Is_Active = 1) {
    const Op = app.Sequelize.Op;
    return await this.findOne({
      where: { 
        Style_No,
        Is_Active,
      },
    });
  };

  //通过
  SppoTitle.buildSerialNo = async function(setting={}) {
    const Op = app.Sequelize.Op;
    const sequelize = app.Sequelize;
    let start = moment().format('YYYY-01-01 00:00:00');
    let end = moment(start).add(1,'y').format('YYYY-01-01 00:00:00');
    let order = [
      ['Serial_NO', 'DESC'],
    ];
    let transaction = null;
    if(typeof(setting.transaction)!="undefined"){
      transaction = setting.transaction;
    }
    let res =  await this.findOne({
      attributes: ['Serial_NO'],
      where: { 
        Create_Time:{
          [Op.gte]: start,
          [Op.lt]: end,
        },
      },
      order
    },{transaction});
    if(!res){
      return 1;
    }
    return parseInt(res.Serial_NO) + 1;
    
  };



  return SppoTitle;
};
