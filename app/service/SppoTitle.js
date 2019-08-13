'use strict';
const mssql = require('mssql');
const Service = require('egg').Service;
class SppoTitleService extends Service {
  async get() {
    // console.log(this.app.config)
    // use db1
    const pool = await mssql.connect(this.app.config.mssql.clients.db1);
    const request = await pool.request();
    // const request = new mssql.Request((await this.app.mssql.get('db1')));
    const rows = await request.query('SELECT * FROM SPPO_Title;');
    mssql.close();
    return rows;
  }

  async find(id) {
    const post = await this.ctx.model.SppoTitle.findById(id);
    if (!post) {
      this.ctx.throw(404, 'post not found');
    }
    return post;
  }
}

module.exports = SppoTitleService;
