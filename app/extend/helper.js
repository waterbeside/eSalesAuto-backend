const NodeCache = require( "node-cache" );
const myCache = new NodeCache({ stdTTL: 60*5});
module.exports = {
   
  /**
   * 支持async await 的 forEach方法
   */
  async  asyncForEach(arr, callback){
    const length = arr.length;
    const O = Object(arr);
    let k = 0;
    while (k < length) {
      if (k in O) {
        console.log('doing foreach...');
        const kValue = O[k];
        await callback(kValue, k, O);
      }
      k++;
    }
  },

  /** 
   * 数字位数补全
   */
  prefixO(num,length){ 
    return (Array(length).join('0')+num).slice(-length); 
  },


  
  async getStoreData(key){
    if(typeof(this.app.redis)=='object'){
      const redis = this.app.redis;
      let caceData = await redis.get(key);
      if(caceData){
        let data = JSON.parse(caceData);
        if(!data){
          return null;
        }else{
          return data;
        }
      }else{
        return null
      }
    }
    // return myCache.get(key);
    if(typeof(this.app.myData)!="undefined" && typeof(this.app.myData[key])!="undefined"){
      return this.app.myData[key] ;
    }else{
      return null;
    }
  },

  async setStoreData(key,value,ex=0){
    if(typeof(this.app.redis)=='object'){
      const redis = this.app.redis;
      let dataString = JSON.stringify(value);

      if(ex > 0){
        await redis.setex(key,ex,dataString);
      }else{
        await redis.set(key,dataString);
      }
    }else{
      if(typeof(this.app.myData)=="undefined"){
        this.app.myData = {};
      }
      this.app.myData[key] = value;
    }
    
    return;
  },
};