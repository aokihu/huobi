const _ = require('lodash')
const request = require('request')
const Promise = require('bluebird')
const md5 = require('md5')

/**
 * 自己的工具方法
 * @type {Object}
 */
module.exports = {
  /**
   * @function APIUrl
   * @abstract 设置API URL
   * @param {String} url 将要设置的url
   */
  APIUrl(url){
    this.url = url
  },
  /**
   * @function serectKey
   * @abstract 设置Serect Key
   * @param {String} key 将要设置的Serect Key
   */
  serectKey(key){
    this.serectKey = key
  },
  /**
   * @function accessKey
   * @abstract 设置Access Key
   * @param {String} key 将要设置的Access Key
   */
  accessKey(key){
    this.accessKey = key
  },
  /**
   * @function sign
   * @abstract 创建签名
   * @param {Object} params 传入请求参数
   * @return {String} 输出签名
   */
  sign(params){
    let unorderd = _.cloneDeep(params)
    unorderd['secret_key'] = this.serectKey

    let ordered = []

    Object.keys(unorderd).sort().forEach(key => {
      ordered.push(`${key}=${unorderd[key]}`)
    })

    return md5(ordered.join('&')).toLowerCase()
  },

  /**
   * @function fetch
   * @abstract 获取指定URL的数据,本方法不负责构建URL
   * @return {Promise}
   */
  fetch(url){

    return new Promise((resolve, reject) => {

      request.get(url, (err, res, body) => {
        resolve(JSON.parse(body))
      })

    });

  },

  /**
   * @function request
   * @abstract 发起HTTP请求
   * @param {Object} params 传入的请求参数
   * @param {Object} extra 额外的请求参数，但是不会计算在签名中
   * @return {Promise} 返回一个Promise对象，成功返回消息包格式json,错误返回错误代码
   */
  request(params, extra=null){

    params['access_key'] = this.accessKey
    params['created'] = Math.floor(Date.now() / 1000) // 这里的时间格式只有10位
    params['sign'] = this.sign(params)

    _.assign(params, extra)

    let opts = {
      url:this.url,
      method:"POST",
      headers:{'Content-type':'application/x-www-form-urlencoded'},
      strictSSL:false,
      form:params
    }

    return new Promise((resolve, reject) => {

      request(opts, (err,res,body) => {

        // 解析返回数据
        try{
          let data = JSON.parse(body)

          if(_.isNil(data.code))
            resolve(data)
          else
            reject(data)
        }catch(err){
          reject(err)
        }


      })
    });

  }

}
