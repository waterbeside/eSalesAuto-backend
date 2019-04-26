'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const SppoTitle = app.model.define('SPPO_Title', {
    ID: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    Creater: STRING(10),
    Create_Time: DATE,
    PPO_NO: STRING(20),
    Last_Updater:STRING(10),
    Update_Time:DATE,
    Rev_NO:DATE,
    PPO_ID:STRING(20),
    Style_No:STRING(20),
    Season:STRING(10),
    Garment_Wash:STRING(20),
    Is_Active: INTEGER,
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
  SppoTitle.findByStyleNo = async function(Style_NO) {
    return await this.findOne({
      where: { 
        PPO_NO:Style_No,
        Is_Active:{
          [Op.gt]: 0
        },
      },
    });
  };

  return SppoTitle;
};
