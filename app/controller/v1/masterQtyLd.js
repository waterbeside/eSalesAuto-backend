'use strict';

// const Controller = require('egg').Controller;
const BaseController = require('../Base');
class MasterQtyLdController extends BaseController {
   
  async getGarmentParts (){
    const { ctx, app } = this;
    let cacheKey = "master:garment_parts";
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }

    let list = [];
    let res = await ctx.model.MasterQtyLD.findAll({
        group: ['Garment_Part'],
        attributes:['Garment_Part']
    });
    
    res.forEach(element => {
      list.push(element.Garment_Part);
    });

    if(list.length > 0){
      await ctx.helper.setStoreData(cacheKey,list,60*60*24);
    }

    return this.jsonReturn(0,{list},'Successfully');

    

  }


}



module.exports = MasterQtyLdController;
