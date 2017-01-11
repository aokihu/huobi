'use strict'
/**
 *  >>>> 申明 <<<<
 *  一旦您使用了本项目以及项目代码就代表一切风险将由您自己承担
 *  本项目以及本项目成员对您有可能造成的财产损失概不负责
 *  如果您不同意本申明，那么您将没有权利使用本项目以及本项目的代码
 *
 */

// 加载自己的工具
const Util = require('./lib/util.js')
const Promise = require('bluebird')

// 币种定义
const COIN_TYPE = ['no','btc','ltc']
// 常量定义
const REFERSH_TIME = 6000 // 每6秒刷新一次

class Huobi {

  /**
   * @function constructor
   * @param {String} accessKey 连接密钥
   * @param {String} secretKey 密码密钥
   * @param {Bollean} refresh 是否自动刷新数据
   * @type {String}
   */

  constructor({accessKey='', secretKey='', refresh=true}) {

    // 这里输入Access Key 和 Secret Key

    Util.accessKey(accessKey)
    Util.secretKey(secretKey)
    Util.APIUrl('https://api.huobi.com/apiv3')

    this._balance_ = {
      total:0,
      net:0,
      cny:0,
      btc:0,
      ltc:0,
      fcny:0,
      fbtc:0,
      fltc:0,
      lcny:0,
      lbtc:0,
      lltc:0
    } // 账户资金

    // 初始化事项
    if(refresh){
      this._refresh()
      setInterval(this._refresh.bind(this), REFERSH_TIME)
    }

  }

  // -------------------------------------------------
  //
  // 属性定义
  //
  // -------------------------------------------------

  /**
   * 获取当前账户资金余额
   * @method balance
   * @return {Object} 包含资金信息的对象
   * Edit By:aokihu
   */

  get balance(){
    return this._balance_
  }

  // -------------------------------------------------
  //
  // 方法定义
  //
  // -------------------------------------------------

  /**
   * @function getNow
   * @abstract 获取实时行情数据
   * @param {String} type 币种类型,比特币'btc',莱特币'ltc'
   * @param {string} market 币种市场,人民币'cny',美元'usd'
   * @return {Promise}
   */
  getNow({type='btc',market='cny'}){
    let _market_ = market === 'cny' ? 'static' : 'usd'
    let url = `http://api.huobi.com/${_market_}market/ticker_${type}_json.js`

    return Util.fetch(url)
  }

  /**
   * @function getAccountInfo
   * @abstract 获取用户账户信息
   * @return {Promise}
   */
  getAccountInfo(){
    return Util.request({method:'get_account_info'})
  }

  /**
   * @function getOrders
   * @abstract 获取所有委托订单
   * @param {String} market 币种市场,有cny人民币和usd美元,默认cny
   * @param {Integer} type 查询币种,比特币=1,莱特币=2
   * @return {Promise}
   */
  getOrders({type=1,market='cny'}){
    return Util.request({method:'get_orders',coin_type:type},{market:market})
  }

  /**
   * @function getNewDealOrders
   * @abstract 查询个人最新10条成交订单
   * @param {String} market 币种市场,有cny人民币和usd美元,默认cny
   * @return {Promise}
   */
  getNewDealOrders({market='cny'}){
    return Util.request({method:'get_new_deal_orders'},{market:market})
  }

  /**
   * @function orderInfo
   * @abstract 获取订单详细内容
   * @param {Integer} type 查询币种,比特币=1,莱特币=2
   * @param {ID} orderID 订单ID
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  orderInfo({type=1, orderId='', market='cny'}){
    return Util.request({method:'order_info',
                         coin_type:type,
                         id:orderId}
    ,{market:market})
  }

  /**
   * @function buy
   * @abstract 指定价位买入
   * @param {Integer} type 币种,比特币=1,莱特币=2
   * @param {Number} price 购买价格
   * @param {Number} amount 购买数量
   * @param {String} pwd 如果设置了交易密码,请添这个参数，如果没有就不用管了
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  buy({type=1, price=0, amount=0, pwd='', market='cny'}){
    let must = {
      'method':'buy',
      'coin_type':type,
      'price':price,
      'amount':amount
    }

    let opt = {
      'trade_password':pwd,
      'market':market
    }

    return Util.request(must, opt)
  }

  /**
   * @function sell
   * @abstract 指定价位卖出
   * @param {Integer} type 币种,比特币=1,莱特币=2
   * @param {Number} price 购买价格
   * @param {Number} amount 购买数量
   * @param {String} pwd 如果设置了交易密码,请添这个参数，如果没有就不用管了
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  sell({type=1, price=0, amount=0, pwd='', market='cny'}){
    let must = {
      'method':'sell',
      'coin_type':type,
      'price':price,
      'amount':amount
    }

    let opt = {
      'trade_password':pwd,
      'market':market
    }

    return Util.request(must, opt)
  }

  /**
   * @function buyMarket
   * @abstract 市场价位买入
   * @param {Integer} type 币种,比特币=1,莱特币=2
   * @param {Number} amount 购买数量
   * @param {String} pwd 如果设置了交易密码,请添这个参数，如果没有就不用管了
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  buyMarket({type=1, amount=0, pwd='', market='cny'}){
    let must = {
      'method':'buy_market',
      'coin_type':type,
      'amount':amount
    }

    let opt = {
      'trade_password':pwd,
      'market':market
    }

    return Util.request(must, opt)
  }


  /**
   * @function sellMarket
   * @abstract 市场价卖出
   * @param {Integer} type 币种,比特币=1,莱特币=2
   * @param {Number} amount 购买数量
   * @param {String} pwd 如果设置了交易密码,请添这个参数，如果没有就不用管了
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  sellMarket({type=1, amount=0, pwd='', market='cny'}){
    let must = {
      'method':'sell_market',
      'coin_type':type,
      'amount':amount
    }

    let opt = {
      'trade_password':pwd,
      'market':market
    }

    return Util.request(must, opt)
  }


  /**
   * @function sellAllMarket
   * @abstract 市场价全部卖出
   * @param {Integer} type 币种,比特币=1,莱特币=2
   * @param {Number} amount 购买数量
   * @param {String} pwd 如果设置了交易密码,请添这个参数，如果没有就不用管了
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   */
  sellAllMarket({type=1,pwd='',market='cny'}){

    // 计算交易金额
    let amount = this._balance_[COIN_TYPE[type]]
    return this.sellMarket({type:type,amount:amount,pwd:'',market:market})

  }

  /**
   * @function cancelOrder
   * @abstract 取消订单
   * @param {Integer} type 币种类型,比特币=1,莱特币=2
   * @param {ID} orderID 订单ID
   * @param {String} market 货币市场,人民币='cny',美元='usd'
   * @return {Promise}
   */
  cancelOrder({type=1, orderId="", market='cny'}){

    return Util.request({method:'cancel_order',
                         coin_type:type,
                         id:orderId}
    ,{market:market})

  }

  // -----------------------------
  //
  // 内部方法定义
  //
  // -----------------------------

  /**
   * @private
   * @function 刷新数据
   */

  _refresh(){

    // 更新账户信息
    this.getAccountInfo()
    .then(data => {
      this._balance_ = {
        total:data.total,
        net:data.net_asset,
        cny:data.available_cny_display,
        btc:data.available_btc_display,
        ltc:data.available_ltc_display,
        fcny:data.frozen_cny_display,
        fbtc:data.frozen_btc_display,
        fltc:data.frozen_ltc_display,
        lcny:data.loan_cny_display,
        lbtc:data.loan_btc_display,
        lltc:data.loan_ltc_display
      }
    })
    .catch(err => console.log(err))
  }


}

// @export
module.exports = Huobi
