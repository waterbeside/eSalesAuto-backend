const NodeCache = require( "node-cache" );

module.exports = {
   
  /**
   * 转换字典key的大小写
   * @param {Object} jsonObj 
   * @param {Integer} type 当为0时转小写，1时转大写
   */
  changeCaseJsonKey(jsonObj,type = 0){
    for (var key in jsonObj){
        let nkey =  type ? key.toUpperCase() : key.toLowerCase();
        jsonObj[nkey] = jsonObj[key];
        if(nkey != key){
            delete(jsonObj[key]);
        }
    }
    return jsonObj;
  },

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