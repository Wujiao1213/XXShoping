// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  const { ids } = event

  try {
    // 批量删除（需要管理端权限）
    const res = await db.collection('cart')
      .where({
        _id: _.in(ids),
        _openid: context.OPENID // 确保只能删除自己的数据
      })
      .remove()

    return {
      code: 0,
      deleted: res.stats.removed
    }
  } catch (err) {
    return {
      code: -1,
      message: err.message
    }
  }
}