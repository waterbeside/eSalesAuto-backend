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


  
  getStoreData(key){
    // return myCache.get(key);
    if(typeof(this.app.myData)!="undefined" && typeof(this.app.myData[key])!="undefined"){
      return this.app.myData[key] ;
    }else{
      return null;
    }
  },

  setStoreData(key,value){
    // myCache.set(key,value);
    if(typeof(this.app.myData)=="undefined"){
      this.app.myData = {};
    }
    this.app.myData[key] = value;
    return;
  },
};