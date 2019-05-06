'use strict';

const Service = require('egg').Service;
class SppoService extends Service {

  async getMasterFabDataByFC(Customer_Fab_Code){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_fab:cfc_" + Customer_Fab_Code;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('masterFabCache')
      return cacheData;
    }
    let res = await ctx.model.MasterFabricationLN.findOne({
      where:{
        Customer_Fab_Code
      }
    });
    ctx.helper.setStoreData(cacheKey,res);
    return res;
  }


  async getSppoFabData(Customer_Fab_Code,PPO_NO) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_fab:cfc_"+Customer_Fab_Code+"_sppoNo_"+PPO_NO;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('fabCache')
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoFabrication.findOne({
      where:{
        Customer_Fab_Code,PPO_NO
      }
    });
    if(res){
      ctx.helper.setStoreData(cacheKey,res);
    }
    return res;
  }

  async getMasterCollarCuffDataByFC(Customer_Fab_Code){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_collar_cuff:cfc_" + Customer_Fab_Code;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('masterFabCache')
      return cacheData;
    }
    let res = await ctx.model.MasterCollarCuffLN.findOne({
      where:{
        Customer_Fab_Code
      }
    });
    ctx.helper.setStoreData(cacheKey,res);
    return res;
  }


  async getSppoCollarCuffData(Customer_Fab_Code,PPO_NO) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_collar_cuff:cfc_"+Customer_Fab_Code+"_sppoNo_"+PPO_NO;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('fabCache')
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoCollarCuff.findOne({
      where:{
        Customer_Fab_Code,PPO_NO
      }
    });
    if(res){
      ctx.helper.setStoreData(cacheKey,res);
    }
    return res;
  }

  
}

module.exports = SppoService;
