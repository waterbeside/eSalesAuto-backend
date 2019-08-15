'use strict';

module.exports = app => {
  const { STRING, INTEGER } = app.Sequelize;

  const Role = app.model.define('Role',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: STRING(20),
      title: STRING(128),
      status: INTEGER,
      sort: INTEGER,
      remark: STRING(255),
    },
    { freezeTableName: true,
      timestamps: false,
    }
  );


  Role.getSelects = async function() {
    const where = { status: 1 };
    const order = [[ 'sort', 'DESC' ]];
    const list = [];
    const res = await this.findAll({ where, order });

    res.forEach(item => {
      list.push({
        id: item.id,
        name: item.name,
        title: item.title,
      });
    });

    return list;
  };

  return Role;
};
