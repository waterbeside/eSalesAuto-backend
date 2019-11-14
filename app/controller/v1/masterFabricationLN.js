'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterFabricationLNController extends BaseController {

  get modelName() {
    return 'MasterFabricationLN';
  }

  async index() {
    const { ctx } = this;
    const pagesize = ctx.request.query.pagesize ? parseInt(ctx.request.query.pagesize) : 20;
    const page = ctx.request.query.page ? parseInt(ctx.request.query.page) : 1;
    let filter = ctx.request.query.filter ? ctx.request.query.filter : '{}';
    filter = ctx.helper.json_decode(filter);

    // 筛选
    const Op = ctx.model.Op;
    const where = {};
    if (filter.customer_fab_code) {
      where.Customer_Fab_Code = {
        [Op.like]: '%' + filter.customer_fab_code + '%',
      };
    }
    if (filter.finishing) {
      where.Finishing = {
        [Op.like]: '%' + filter.finishing + '%',
      };
    }
    if (filter.refer_ppo_usage) {
      where.Refer_PPO_Usage = {
        [Op.like]: '%' + filter.refer_ppo_usage + '%',
      };
    }

    // 排序
    const order = [[ 'ID', 'DESC' ]];

    // 计算总数
    const res = await this.pageList({
      where,
      order,
    }, { page, pagesize, model: ctx.model.MasterFabricationLN });
    let code = -1;
    if (res) {
      code = res.list ? 0 : 20002;
    }
    return ctx.jsonReturn(code, res, 'Successful');

  }


  /**
   * 新增
   */
  async create() {
    const { ctx } = this;

    const data = ctx.request.body;
    const Customer_Fab_Code = data.Customer_Fab_Code;
    let errorMsg = '';
    const errorFields = {};


    const checkUniqueRes = await ctx.model.MasterFabricationLN.checkUnique(Customer_Fab_Code, 0);
    if (!checkUniqueRes) {
      errorMsg = 'Customer_Fab_Code已经存在';
      errorFields.Customer_Fab_Code = errorMsg;
      return ctx.jsonReturn(992, {
        errorFields,
      }, errorMsg);
    }

    // if(sales_team)
    const upData = {
      Customer_Fab_Code,
      Refer_PPO_Usage: data.Refer_PPO_Usage,
      Dye_Method: data.Dye_Method,
      Fab_Desc: data.Fab_Desc,
      Fab_Pattern: data.Fab_Pattern,
      Fab_Type: data.Fab_Type,
      Fab_Width: data.Fab_Width,
      Fab_Remark: data.Fab_Remark,
      Finishing: data.Finishing,
      Shrinkage: data.Shrinkage,
      Shrinkage_Test_Method: data.Shrinkage_Test_Method,
      Weight_AW: parseInt(data.Weight_AW),
      Weight_BW: parseInt(data.Weight_BW),
      Yarn_Type: data.Yarn_Type,
      Yarn_Strands: data.Yarn_Strands,
      Yarn_Ratio: data.Yarn_Ratio,
      Yarn_Count: data.Yarn_Count,
      Create_Time: new Date(),
      Update_Time: new Date(),
    };
    try {
      const res = await ctx.model.MasterFabricationLN.create(upData);
      if (res) {
        return ctx.jsonReturn(0, {
          id: res.id,
        }, 'Successfully');
      }
    } catch (error) {
      return ctx.jsonReturn(-1, { error }, '提交失败，请稍候再试');
    }

    return ctx.jsonReturn(-1, null, '提交失败，请稍候再试');
  }

  /**
   * 编辑
   */
  async update() {
    const { ctx } = this;
    const id = parseInt(ctx.params.id);
    const data = ctx.request.body;
    const Customer_Fab_Code = data.Customer_Fab_Code;
    let errorMsg = '';
    const errorFields = {};
    const checkUniqueRes = await ctx.model.MasterFabricationLN.checkUnique(Customer_Fab_Code, id);
    if (!checkUniqueRes) {
      errorMsg = 'Customer_Fab_Code已经存在';
      errorFields.Customer_Fab_Code = errorMsg;
      return ctx.jsonReturn(992, {
        errorFields,
      }, errorMsg);
    }

    // if(sales_team)
    const upData = {
      Customer_Fab_Code,
      Refer_PPO_Usage: data.Refer_PPO_Usage,
      Dye_Method: data.Dye_Method,
      Fab_Desc: data.Fab_Desc,
      Fab_Pattern: data.Fab_Pattern,
      Fab_Type: data.Fab_Type,
      Fab_Width: data.Fab_Width,
      Fab_Remark: data.Fab_Remark,
      Finishing: data.Finishing,
      Shrinkage: data.Shrinkage,
      Shrinkage_Test_Method: data.Shrinkage_Test_Method,
      Weight_AW: parseInt(data.Weight_AW),
      Weight_BW: parseInt(data.Weight_BW),
      Yarn_Type: data.Yarn_Type,
      Yarn_Strands: data.Yarn_Strands,
      Yarn_Ratio: data.Yarn_Ratio,
      Yarn_Count: data.Yarn_Count,
      Update_Time: new Date(),
    };
    const res = await ctx.model.MasterFabricationLN.update(upData, {
      where: {
        id,
      },
    });
    if (res && res[0] > 0) {
      return ctx.jsonReturn(0, 'Successfully');
    }
    return ctx.jsonReturn(-1, null, '提交失败，请稍候再试');
  }

  /**
   * 查出所有可选的CustomerFabCodes;
   */
  async getCustomerFabCodes() {
    const { ctx } = this;
    const cacheKey = 'master:fabricationLN:customer_fab_codes';
    const cacheData = await ctx.helper.getStoreData(cacheKey);
    if (cacheData) {
      return ctx.jsonReturn(0, { list: cacheData }, 'Successfully');
    }

    const list = [];
    const res = await ctx.model.MasterFabricationLN.findAll(
      {
        group: [ 'Customer_Fab_Code' ],
        attributes: [ 'Customer_Fab_Code' ],
      }
    );
    res.forEach(item => {
      list.push(item.Customer_Fab_Code);
    });

    if (list.length > 0) {
      await ctx.helper.setStoreData(cacheKey, list, 60 * 60 * 24);
    }

    return ctx.jsonReturn(0, { list }, 'Successfully');

  }


  async checkExist() {
    const { ctx } = this;
    const Customer_Fab_Code = ctx.request.query.customer_fab_code;
    const where = {
      Customer_Fab_Code,
    };
    const res = await ctx.model.MasterFabricationLN.count({ where });
    return ctx.jsonReturn(0, { is_exist: res }, 'Successfully');
  }
}
module.exports = MasterFabricationLNController;
