const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event) => {
  // 直接通过云函数上下文获取 openid
  const { OPENID } = cloud.getWXContext()
  return {
    openid: OPENID
  }
}