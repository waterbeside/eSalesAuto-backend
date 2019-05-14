'use strict';

const moment = require('moment');
const _ = require('lodash');
const Service = require('egg').Service;
class GoService extends Service {
  
  /**
   * 生成GO_NO前部分
   */
  async buildBaseGoNo(gmt_fty){
    const { ctx, app } = this;   
    let cacheKey = "sppo:baseGoNo:fty_"+gmt_fty;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await ctx.service.genFactory.getFactorysByFtyID(gmt_fty);
    if(!res){
      return false;
    }
    let f_Code  = res.FTY_ID_FOR_GO;
    let year_no = moment().format('YY');
    let baseGoNo = 'S' + year_no + f_Code;
    await ctx.helper.setStoreData(cacheKey,baseGoNo,60);
    return baseGoNo;

  }
  

  /**
   * 通过 style_no 和 combo生成 SKU
   * @param {String} style_no 
   * @param {String} combo 
   */
  getSKU(style_no,combo){
    let sku = '';
    if(typeof(combo)!='undefined' && combo.length > 3){
       let combo_no = combo.substring(0,2);
       if(parseInt(combo_no)>0){
         sku = style_no + '-' + parseInt(combo_no);
       }
    }
    return sku;
  }

  /**
   * 检查列表中，相同的某一个字段，其它所有另一个字段必须相同
   * @param {Object} row  当前行
   * @param {Object} list 当前列表
   * @param {Array} fields 要查的字段
   */
  checkMustSame(row,list,fields){
    let code = 0;
    let msg = '';
    let otherdRowIndex = list.findIndex(item=>{
      return (_.trim(item[fields[0]]) == _.trim(row[fields[0]]) && _.trim(item[fields[1]]) != _.trim(row[fields[1]]) &&  item.id != row.id);
    })
    if(otherdRowIndex != -1){
      code = 1;
      return otherdRowIndex;
    }else{
      return -1;
    }
  }


}

module.exports = GoService;
