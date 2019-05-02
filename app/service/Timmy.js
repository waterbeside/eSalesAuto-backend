'use strict';

const Service = require('egg').Service;
class TimmyService extends Service {
  async get() {
    console.log(this.app.oracle);
    const connection = await this.app.oracle.getConnection();
    
    const result = await connection.execute('SELECT * FROM TIMMY');
    connection.close();
    console.log(result);
    return result;
  }

  async find(id) {
    console.log(typeof(this.ctx.model.SppoTitle.findById));
    const post = await this.ctx.model.SppoTitle.findById(id);
    if (!post) {
      this.ctx.throw(404, 'post not found');
    }
    return post;
  }
}

module.exports = TimmyService;
