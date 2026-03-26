// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const { month } = event // 格式：'YYYY-MM'

  if (!month) {
    return {
      success: false,
      error: 'Missing month parameter'
    }
  }

  const startDate = `${month}-01`
  // 简单计算下个月的第一天
  let [year, m] = month.split('-')
  let nextMonth = parseInt(m) + 1
  let nextYear = parseInt(year)
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear += 1
  }
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

  try {
    // 获取当月所有记录
    const { data: records } = await db.collection('records')
      .where({
        userId: wxContext.OPENID,
        date: _.gte(startDate).and(_.lt(endDate))
      })
      .limit(1000) // 假设每月记录不超过1000条
      .get()

    let totalIncome = 0
    let totalExpense = 0
    const categoryMap = {}

    records.forEach(record => {
      const amount = Number(record.amount)
      if (record.type === 'income') {
        totalIncome += amount
      } else if (record.type === 'expense') {
        totalExpense += amount
        // 统计分类支出
        if (categoryMap[record.category]) {
          categoryMap[record.category] += amount
        } else {
          categoryMap[record.category] = amount
        }
      }
    })

    const balance = totalIncome - totalExpense

    // 格式化分类数据用于饼图
    const categoryData = Object.keys(categoryMap).map(key => ({
      name: key,
      value: categoryMap[key]
    })).sort((a, b) => b.value - a.value)

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        categoryData
      }
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}
