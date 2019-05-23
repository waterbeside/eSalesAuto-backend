const NodeCache = require( "node-cache" );

module.exports = {
   

  /**
   * 用于接口输出,返回指定的json
   * @param {Integer} code 状态码
   * @param {Array} data 
   * @param {String} msg 
   */
  jsonReturn(code,data = null,msg = "",extra=null) {
    if(typeof(data)=="string"){
      msg = data;
      data = null;
    }
    let now = new Number(new Date().getTime()/1000).toFixed(0)
    this.body = {code,data,msg,date:now,extra};
    return false;
    // process.exit(1);
  }

};