'use strict';

const moment = require('moment');
const _ = require('lodash');
const Service = require('egg').Service;
class SppoService extends Service {
  

  //取得Unit数据
  async getUnitByGP(garment_part){
    const { ctx, app } = this;   
    let cacheKey = "sppo:master_unit:garmentPart_"+garment_part;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    let Unit = await ctx.model.MasterUnit.getUnitByGP(garment_part);
    if(Unit){
      await ctx.helper.setStoreData(cacheKey,Unit,60*5);
      return Unit;
    }else{
      return '';
    }
  }

  

  // 2）
  async getSppoGpDelDesData(Garment_Part,PPO_ID) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_gp_del_des:ppoId_"+PPO_ID+"_garmentPart_"+Garment_Part;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    // let cacheData = await this.ctx.helper.getStoreData('test')
    const res = await  ctx.model.SppoGpDelDestinationInfo.findOne({where:{PPO_ID,Garment_Part}});
    if(res){
      await ctx.helper.setStoreData(cacheKey,res,60);
    }
    return res;
  }
  
  //5)
  async getMasterQtyData(Garment_Part){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_qty:garmentPart_"+Garment_Part;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await  ctx.model.MasterQtyLD.findOne({where:{Garment_Part},order:[['Garment_Part', 'DESC']]});
    await ctx.helper.setStoreData(cacheKey,res,60);
    return res;

  }

  //5 getSppoColorQtyData
  async getSppoColorQtyData(Garment_Part,PPO_ID){
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_color_qty:ppoId_"+PPO_ID+"_garmentPart_"+Garment_Part;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await  ctx.model.SppoColorQtyInfo.findOne({where:{PPO_ID,Garment_Part}});
    if(res){
      await ctx.helper.setStoreData(cacheKey,res,60);
    }
    return res;

  }


  // 3）
  async getMasterFabDataByFC(Customer_Fab_Code){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_fab:cfc_" + Customer_Fab_Code;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('masterFabCache')
      return cacheData;
    }
    let res = await ctx.model.MasterFabricationLN.findOne({
      where:{
        Customer_Fab_Code
      }
    });
    await ctx.helper.setStoreData(cacheKey,res,60);
    return res;
  }

  // 3）
  async getSppoFabData(Customer_Fab_Code,PPO_ID) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_fab:cfc_"+Customer_Fab_Code+"_sppoID_"+PPO_ID;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('fabCache')
      return cacheData;
    }
    // let cacheData = this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoFabrication.findOne({
      where:{
        Customer_Fab_Code,PPO_ID
      }
    });
    if(res){
      await ctx.helper.setStoreData(cacheKey,res,60);
    }
    return res;
  }

  // 4）
  async getMasterCollarCuffDataByFC(Customer_Fab_Code){
    const { ctx , app} = this;
    let cacheKey = "sppo:master_collar_cuff:cfc_" + Customer_Fab_Code;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('masterFabCache')
      return cacheData;
    }
    let res = await ctx.model.MasterCollarCuffLN.findOne({
      where:{
        Customer_Fab_Code
      }
    });
    await ctx.helper.setStoreData(cacheKey,res,60);
    return res;
  }

  // 4）
  async getSppoCollarCuffData(Customer_Fab_Code,PPO_ID) {
    const { ctx , app} = this;
    let cacheKey = "sppo:sppo_collar_cuff:cfc_"+Customer_Fab_Code+"_sppoID_"+PPO_ID;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      console.log('fabCache')
      return cacheData;
    }
    // let cacheData = await this.ctx.helper.getStoreData('test')
    const res = await ctx.model.SppoCollarCuff.findOne({
      where:{
        Customer_Fab_Code,PPO_ID
      }
    });
    if(res){
      await ctx.helper.setStoreData(cacheKey,res,60);
    }
    return res;
  }



  //get sppoDetail
  async getDetail(ppo_no){
    const { ctx, app } = this;   
    
    let data = {}
    data.sppoTitle = await ctx.model.SppoTitle.findOne({
      where:{PPO_NO:ppo_no,Is_Active:1},
      order:[['Rev_NO','DESC']]
    });
    if(!data.sppoTitle){
      return null;
    }
    let PPO_ID = data.sppoTitle.PPO_ID;
    let PPO_NO = data.sppoTitle.PPO_NO;
    data.sppoTitle.setDataValue('Create_Time',moment(data.sppoTitle.Create_Time).valueOf());
    data.sppoTitle.setDataValue('Update_Time',moment(data.sppoTitle.Update_Time).valueOf());

    data.sppoGpDelDest = await ctx.model.SppoGpDelDestinationInfo.findAll({
      where:{PPO_ID},
    });

    data.sppoColorQty = await ctx.model.SppoColorQtyInfo.findAll({
      where:{PPO_ID},
    });

    data.sppoFabrication = await ctx.model.SppoFabrication.findAll({
      where:{PPO_NO},
    });

    data.sppoCollarCuff = await ctx.model.SppoCollarCuff.findAll({
      where:{PPO_ID},
    });

    // data.itemList = []; 
    // data.sppoGpDelDest.forEach((item,index)=>{
    //   let newItem = {};
    //   newItem.sppoGpDelDest = item;
    //   newItem.sppoColorQty =_.filter(data.sppoColorQty,{PPO_ID,Garment_Part:item.Garment_Part});
    //   newItem.sppoFabrication =_.filter(data.sppoFabrication,{PPO_NO,Customer_Fab_Code:item.Customer_Fab_Code});
    //   newItem.sppoCollarCuff =_.filter(data.sppoCollarCuff,{PPO_ID,Customer_Fab_Code:item.Customer_Fab_Code});
    //   data.itemList.push(newItem);
    // })
    return data;
    // return this.jsonReturn(0,data,'success');
  }


  

   /**
   * 生成PPO_NO前部分
   */
  async buildBasePpoNo(username){
    const { ctx, app } = this;   
    let cacheKey = "sppo:basePpoNo:user_"+username;
    let cacheData = await ctx.helper.getStoreData(cacheKey);
    if(cacheData){
      return cacheData;
    }
    const res = await ctx.service.genUsers.getDepartmentIdByUsername(username);
    if(!res){
      return false;
    }
    let sales_team  = res.DEPARTMENT_ID;
    let sales_team_code = sales_team.substring(0,1);
    let year_no = moment().format('YY');
    let basePpoNo = 'KSF'+year_no+sales_team_code+sales_team;
    await ctx.helper.setStoreData(cacheKey,basePpoNo,60);
    return basePpoNo;

  }


  /**
   * 创建一个 PPO_NO
   */
  async buildPpoNo(){
    const { ctx, app } = this;   
    let res = await ctx.model.SppoTitle.buildSerialNo();
    if(!res){
      return false;
    }
    let SerialNo =  ctx.helper.prefixO(res,5);
    let basePpoNo = await this.buildBasePpoNo();
    return basePpoNo+SerialNo;
  }


  //验证重复的 Garment_Part Customer_Fab_Code;
  check_gp_cfc_same (dataList){
    const { ctx, app } = this;   
    
    let hasError = 0;
    this.errorData = typeof(this.errorData) != 'undefined' ? this.errorData : {}
    this.errorData.errorIndex = [];
    let list  = dataList.map(el=>{
      return ctx.helper.changeCaseJsonKey(Object.assign({},el));
    })
    for(let i in list){
      let row = list[i];
      let garment_part = row.garment_part;
      let customer_fab_code = row.customer_fab_code;
      let otherdRowIndex = list.findIndex((item,index)=>{
        console.log('i:index='+i+':'+index);
        console.log('garment_part='+garment_part+':'+item.garment_part);
        console.log('customer_fab_code='+customer_fab_code+':'+item.customer_fab_code);
        return ( _.trim(item.garment_part) == _.trim(garment_part) && _.trim(item.customer_fab_code) != customer_fab_code &&  i != index);
      })
      if(otherdRowIndex != -1){
        hasError = 1;
        this.errorData.errorIndex.push(parseInt(i),otherdRowIndex);
        break;
      }
    }
      return  hasError ? false : true;
  }
  
}

module.exports = SppoService;
