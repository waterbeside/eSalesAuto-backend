'use strict';

const Service = require('egg').Service;
class SppoService extends Service {
  

  //取得Unit数据
  async getUnitByGP(garment_part){
    const { ctx, app } = this;   
    let cacheKey = "sppo:master_unit:garmentPart_"+garment_part;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    let Unit = await ctx.model.MasterUnit.getUnitByGP(garment_part);
    if(Unit){
      ctx.helper.setStoreData(cacheKey,Unit);
      return Unit;
    }else{
      return '';
    }
  }

  

  // 2）
  async getSppoGpDelDesData(Garment_Part,PPO_ID) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_gp_del_des:ppoId_"+PPO_ID+"_garmentPart_"+Garment_Part;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await  ctx.model.SppoGpDelDestinationInfo.findOne({where:{PPO_ID,Garment_Part}});
    if(res){
      ctx.helper.setStoreData(cacheKey,res);
    }
    return res;
  }
  
  //5)
  async getMasterQtyData(Garment_Part){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_qty:garmentPart_"+Garment_Part;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await  ctx.model.MasterQtyLD.findOne({where:{Garment_Part},order:[['Garment_Part', 'DESC']]});
    ctx.helper.setStoreData(cacheKey,res);
    return res;

  }

  //5 getSppoColorQtyData
  async getSppoColorQtyData(Garment_Part,PPO_ID){
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_color_qty:ppoId_"+PPO_ID+"_garmentPart_"+Garment_Part;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await  ctx.model.SppoColorQtyInfo.findOne({where:{PPO_ID,Garment_Part}});
    if(res){
      ctx.helper.setStoreData(cacheKey,res);
    }
    return res;

  }


  // 3）
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

  // 3）
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

  // 4）
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

  // 4）
  async getSppoCollarCuffData(Customer_Fab_Code,PPO_ID) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_collar_cuff:cfc_"+Customer_Fab_Code+"_sppoID_"+PPO_ID;
    let cacheData = ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('fabCache')
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoCollarCuff.findOne({
      where:{
        Customer_Fab_Code,PPO_ID
      }
    });
    if(res){
      ctx.helper.setStoreData(cacheKey,res);
    }
    return res;
  }

  
}

module.exports = SppoService;
