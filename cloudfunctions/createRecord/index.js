// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { amount, type, category, remark, date } = event

  // 参数校验
  if (!amount || !type || !category || !date) {
    return {
      success: false,
      error: 'Missing required parameters'
    }
  }

  try {
    const result = await db.collection('records').add({
      data: {
        userId: wxContext.OPENID,
        amount: Number(amount),
        type: type, // 'income' or 'expense'
        category: category,
        remark: remark || '',
        date: date,
        createTime: db.serverDate()
      }
    })

    return {
      success: true,
      _id: result._id
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}
