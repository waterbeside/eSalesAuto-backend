'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
const moment = require('moment');
const _ = require('lodash');

class UserController extends BaseController {


  /**
   * user list
   */
  async index() {
    const { ctx, app } = this;    
    let keyword = ctx.request.query.keyword;
    let role = ctx.request.query.role;
    let date_start = ctx.request.query.date_start ? parseInt(ctx.request.query.date_start) : 0;
    let date_end = ctx.request.query.date_end  ? parseInt(ctx.request.query.date_end) : 0;
    const userData = await this.getUserData();
    const username = userData.username;
    
    let pagesize = ctx.request.query.pagesize ? ctx.request.query.pagesize : 20;
    let page = ctx.request.query.page ? ctx.request.query.page : 1;
    //筛选
    const Op = ctx.model.Op;
    
    let where = {
      is_delete: 0,
    }
    
    if(role){
      where.roles = {
        [Op.like]:'%'+role+'%'
      }
    }
    if(keyword){
      where[Op.or] = [
        {username: {[Op.like]:'%'+keyword+'%'}},
        {FullName: {[Op.like]:'%'+keyword+'%'}},
        {email: {[Op.like]:'%'+keyword+'%'}},
      ]
    }
    if(date_start && date_end){
      where.create_time = {
        [Op.gte]: date_start,
        [Op.lt]: date_end+(1000*60*60*24)
      };
    }
    //字段
    let attributes = ['id','username','status','roles','sales_team','FullName','create_time','last_login_time']

    //排序
    let order = [
      ['id', 'ASC'],
    ];
    //分页
    let limit = pagesize;
    let total = await ctx.model.User.count({where}); //计算总数
    let pagination = this.pagination({total,page,pagesize});
    let offset = pagination.offset;
    if(total == 0){
      return ctx.jsonReturn(20002,{list:[],pagination},'No data');
    }
    //查询
    let res = await ctx.model.User.findAll({where,order,offset,limit,attributes});
   
    // // console.log(res)
    if(res.length == 0){
      return ctx.jsonReturn(20002,{list:[],pagination},'No data');
    }
    
    let list = res.map((item,index) => {
      let newItem = Object.assign(item.dataValues);
      newItem.create_time = moment(item.create_time).valueOf();
      newItem.last_login_time = moment(item.last_login_time).valueOf();
      return newItem;
    });
    
    let returnData = {
      list,
      pagination
    };
    return ctx.jsonReturn(0,returnData,'Successfully');
  }


  /**
   * 明细
   */
  async show(){
    const { ctx, app } = this;
    let id = parseInt(ctx.params.id);
    if(id < 1){
      return ctx.jsonReturn(992,{},'Lost ID');
    }
    let attributes = ['id','username','status','roles','sales_team','FullName','create_time','last_login_time','email']
    let where = {id,is_delete:0}
    let res  = await ctx.model.User.findOne({
      where,attributes
    })
    return ctx.jsonReturn(0,res,'Successfully');
  }

  /**
   * 新增用户
   */
  async create(){
    const { ctx, app } = this;
    let data = ctx.request.body;
    let username = data.username;
    console.log(data)
    let hasError = 0;
    let errorMsg = '';
    let errorFields = {};
   
    let unEmptyFields = ['FullName','sales_team','username','role']
    for(let i in unEmptyFields){
      let item = unEmptyFields[i];
      if(typeof(data[item]) == 'undefined' || _.trim(data[item]) == ''){
        hasError = true;
        errorMsg = item + '不能为空'
        errorFields[item] = errorMsg;
        break;
      }else{
        data[item] =  _.trim(data[item]);
      }
    }
    if(hasError){
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }

    if(![0,1].includes(data.status)){
      errorMsg = '状态必须为0或1'
      errorFields['status'] = errorMsg;      
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }

    //验证用户名合法性
    if (!ctx.helper.validate.isNoSpaces(username)) {    
      errorMsg = '用户名不能有空格'
      errorFields['username'] = errorMsg;   
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    } else if (!ctx.helper.validate.isNoSpecialBut_(username)) {
      errorMsg = '用户名只允许由字母数字和下划线组成'
      errorFields['username'] = errorMsg;   
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }else{
      let checkUniqueRes =  await ctx.model.User.checkUnique(username,0);
      if(!checkUniqueRes){
        errorMsg = '用户名已经被占用'
        errorFields['username'] = errorMsg;   
        return ctx.jsonReturn(992,{errorFields},errorMsg);
      }
    }
    username = username.toLowerCase();
  
    //验证email合法性
    if(data.email && !ctx.helper.validate.isEmail(data.email)){
      errorMsg = '邮箱格式不正确'
      errorFields['email'] = errorMsg;      
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }

    //验证密码    
    let password = '';
    let salt = '';
    if(data.pass){
      let passRes = ctx.model.User.createPassword(data.pass);
      password = passRes.password;
      salt = passRes.salt;
    }else{
      errorMsg = '密码不能为空'
      errorFields['pass'] = errorMsg;      
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }

    // if(sales_team)
    let upData = {
      username,
      password,
      salt,
      FullName    : data.FullName,
      sales_team  : data.sales_team.toUpperCase(),
      status      : data.status ? 1 : 0,
      create_time : new Date(),
      is_delete   : 0,
      roles        : data.role
    }
    if(data.email){
      upData.email = data.email;
    }
    
    let res =  await ctx.model.User.create(upData);
    if(res){
      return ctx.jsonReturn(0,{id:res.id},'Successfully');
    }else{
      return ctx.jsonReturn(-1,null,'提交失败，请稍候再试'); 
    }


  }

  /**
   * 修改用户
   */
  async update(){
    const { ctx, app } = this;
    let id = parseInt(ctx.params.id);
    let data = ctx.request.body;
    console.log(data)
    let hasError = 0;
    let errorMsg = '';
    let errorFields = {};
    if(!id){
      return ctx.jsonReturn(992,null,'Error id');
    }
    let unEmptyFields = ['FullName','sales_team']
    for(let i in unEmptyFields){
      let item = unEmptyFields[i];
      if(typeof(data[item]) == 'undefined' || _.trim(data[item]) == ''){
        hasError = true;
        errorMsg = item + '不能为空'
        errorFields[item] = errorMsg;
        break;
      }else{
        data[item] =  _.trim(data[item]);
      }
    }
    if(hasError){
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }

    if(![0,1].includes(data.status)){
      errorMsg = '状态必须为0或1'
      errorFields['status'] = errorMsg;      
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }
    
    if(data.email && !ctx.helper.validate.isEmail(data.email)){
      errorMsg = '邮箱格式不正确'
      errorFields['email'] = errorMsg;      
      return ctx.jsonReturn(992,{errorFields},errorMsg);
    }


    let upData = {
      FullName    : data.FullName,
      sales_team  : data.sales_team.toUpperCase(),
      status      : data.status ? 1 : 0,
    }
    if(data.email){
      upData.email = data.email;
    }
    if(data.role){
      upData.roles = data.role;
    }
    if(data.pass){
      let passRes = ctx.model.User.createPassword(data.pass);
      upData.password = passRes.password;
      upData.salt = passRes.salt;
    }
    let res =  await ctx.model.User.update(upData,{where:{id}});

    if(res && res[0] > 0){
      return ctx.jsonReturn(0,'Successfully');
    }else{
      return ctx.jsonReturn(-1,null,'提交失败，请稍候再试'); 
    }
  }

  /**
   * 删除用户
   */
  async destroy(){
    const { ctx, app } = this;
   
    let ids = ctx.request.query.id ? ctx.request.query.id : ctx.request.body.id;

    if(!ids){
      return ctx.jsonReturn(-1,"请选择要删除的数据");
    }
    const userData = await this.getUserData();
    const username = userData.username;

    let idsArray = ids.toString().split(',');
    if(idsArray.includes('1')){
      return ctx.jsonReturn(-1,'创始管理员账号不可被删除');

    }
    const Op = ctx.model.Op;
    let where = {
      id:{
        [Op.in]:idsArray,
      },
    }

    let res = await ctx.model.User.update({is_delete:1},{where});
    console.log(res);
    if(res && res[0]>0){
      return ctx.jsonReturn(0,'Successfully');
    }else{
      return ctx.jsonReturn(-1,'Failed');

    }



  }



  

  /**
   * 验证用户名是否重复
   */
  async checkUnique(){
    const { ctx, app } = this;    
    let id = ctx.request.query.id ||  ctx.request.body.id || 0;
    let username = ctx.request.query.username ||  ctx.request.body.username;
    if(!username){
      return ctx.jsonReturn(992,null,'参数有误');
    }
    let res = await ctx.model.User.checkUnique(username,id);
    return ctx.jsonReturn(0,{isUnique:res},'Successfully');
  }

}



module.exports = UserController;
