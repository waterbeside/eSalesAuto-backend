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
  },
  {freezeTableName: true,
    timestamps: false, 
  }
 );

  SppoTitle.findById = async function(id) {
    return await this.findOne({
      where: { ID:id },
    });
  };

  return SppoTitle;
};
