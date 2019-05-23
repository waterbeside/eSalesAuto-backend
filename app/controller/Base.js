'use strict';

const Controller = require('egg').Controller;

class BaseController extends Controller {


  /**
   * 取得用户信息 
   */
  async getUserData(type = 0){
    const { ctx , app} = this;
    if(typeof(app.myData)=='undefined'){
      return false;
    }
    if(typeof(app.myData.jwt_decoded)=='undefined'){
      return false;
    }
    app.myData.userBaseData = {
      "uid" : app.myData.jwt_decoded.uid,
      "username" : app.myData.jwt_decoded.username,
    }
    if(type){
      let uid = app.myData.jwt_decoded.uid;
      let res = await ctx.model.User.findByUid(uid);
      
      if(res){
        res.roles = res.roles ? res.roles.split(',') : [];
        res.uid = res.id;
        return res
      }
    }else{
      if(typeof(app.myData.userBaseData)!='undefined' ){
        return app.myData.userBaseData;
      }
    }
    return false;
  }
  

  
  /**
   * 返回分页页码数据
   * @param {Object} param0 
   */
  pagination ({total, page, pagesize}){
    total = parseInt(total);
    page  = parseInt(page) ? parseInt(page) : 1;
    let offset = (page - 1)*pagesize;
    let pagecount = Math.ceil(total/pagesize);
    return {
      total,page,pagesize,offset,pagecount
    }
  }


}

module.exports = BaseController;
