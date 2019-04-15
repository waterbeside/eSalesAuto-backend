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
