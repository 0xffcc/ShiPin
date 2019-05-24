// https://docs.open.alipay.com/309

const crypto = require('crypto')

const moment = require('moment')

// 1.返回给移动端签名字符串：

router.post('createAliPayment', async (ctx, next) => {
  const orderInfo = await model.order.findOne({
    'orderStatus.status': {
      $in: [1, 9]
    },
    orderCode: ctx.params.orderCode,
    createdBy: ctx.user.userid,
    isDelete: false
  }, {
      _id: 0,
      orderCode: 1,
      transCode: 1,
      orderProducts: 1,
      CNYCharge: 1
    })
  if (!orderInfo) {
    throw {
      status: 20001,
      message: 'paying orderInfo not exists'
    }
    return
  }
  let aliPaySignObj = {
    app_id: '支付宝商户Id',
    method: 'alipay.trade.app.pay',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0',
    notify_url: `${config.notify_ulr}`,
    biz_content: JSON.stringify({
      body: '冰糖葫芦',
      subject: '冰糖葫芦',
      out_trade_no: orderInfo.orderCode,
      timeout_express: '15m',
      total_amount: Number(orderInfo.CNYCharge).toString(),
      product_code: 'QUICK_MSECURITY_PAY'
    })
  };
  let signStr = '',
    encodeStr = '';
  for (let n of Object.keys(aliPaySignObj).sort()) {
    signStr += (n + '=' + aliPaySignObj[n] + '&');
    encodeStr += (n + '=' + encodeURIComponent(aliPaySignObj[n]) + '&');
  }
  signStr = signStr.substring(0, signStr.length - 1);
  var signer = crypto.createSign('RSA-SHA256').update(signStr);
  let privateKey = fse.readFileSync(path.join(__dirname, '../alipay_private_key.pem')).toString();
  let sign = signer.sign(privateKey, 'base64')
  ctx.body = {
    encodeStr: encodeStr + 'sign=' + encodeURIComponent(sign)
  }
})

// 2.支付宝回调

router.post('notifyFromAliPay', async (ctx, next) => {
  const resData = ctx.params;
  if (!(resData && resData.trade_status && resData.trade_status == 'TRADE_SUCCESS')) {
    ctx.body = 'fail';
    return;
  }
  //1.验证签名信息
  let signStr = '';
  for (let n of Object.keys(resData).sort()) {
    if (n !== 'sign' && n !== 'sign_type') {
      signStr += (n + '=' + decodeURIComponent(resData[n]) + '&');
    }
  }
  signStr = signStr.substring(0, signStr.length - 1);
  let signer = crypto.createVerify('RSA-SHA256').update(signStr);
  const aliPublicKey = fse.readFileSync(path.join(__dirname, "../alipay_public_key.pem")).toString();
  const sign = signer.verify(aliPublicKey, resData.sign, 'base64');
  if (!sign) {
    ctx.body = 'fail';
    return;
  }
  const orderCodePhoto = resData.out_trade_no;
  const orderDb = await model.order.findOne({
    orderCode: orderCodePhoto
  }, {
      _id: 0,
      siteId: 1,
      CNYCharge: 1,
      usePPCodes: 1,
      orderProducts: 1,
      virtualProducts: 1,
      createdBy: 1,
      charge: 1
    })
  if (!orderDb) {
    throw new Error('alipay notify orderCode not exists !')
  }
  let queryAlipayParams = {
    app_id: '支付宝商户Id',
    method: 'alipay.trade.query',
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
    version: '1.0',
    biz_content: JSON.stringify({
      out_trade_no: orderCodePhoto,
      trade_no: resData.trade_no
    })
  }
  let signString = '',
    encodeStr = '';
  for (let n of Object.keys(queryAlipayParams).sort()) {
    signString += (n + '=' + queryAlipayParams[n] + '&');
    encodeStr += (n + '=' + encodeURIComponent(queryAlipayParams[n]) + '&');
  }
  signString = signString.substring(0, signString.length - 1);
  var signQuery = crypto.createSign('RSA-SHA256').update(signString);
  let privateKey = fse.readFileSync(path.join(__dirname, '../alipay_private_key.pem')).toString();
  let signrs = encodeURIComponent(signQuery.sign(privateKey, 'base64'));
  const querParams = encodeStr + `sign=${signrs}`;
  const queryAlipayResult = await request.getAsync({
    url: 'https://openapi.alipay.com/gateway.do?' + querParams
  })
  const aplipayQueryResult = queryAlipayResult && JSON.parse(queryAlipayResult.body) || '';
  if (!aplipayQueryResult) {
    ctx.body = 'fail';
    return;
  }
  const aplipayqr = aplipayQueryResult.alipay_trade_query_response;
  if (!(aplipayqr.code == '10000' && aplipayqr.msg == 'Success' && aplipayqr.trade_status == 'TRADE_SUCCESS' && Number(aplipayqr.total_amount) == orderDb.CNYCharge)) {
    ctx.body = 'fail';
    return;
  }
  try {
    ctx.body = 'success';
    //更新业务操作
  } catch (err) {
    throw new Error(err)
  }
})