// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const { audioFile, text } = event

  try {
    // 这里应该是调用外部AI服务（如腾讯云ASR）将语音转为文字的代码
    // 由于缺乏外部API的真实密钥，此处使用传入的text或者模拟文本进行处理
    let recognizedText = text || "今天午饭花了25元" // 模拟识别结果

    // 简单的正则表达式提取金额
    let amount = 0
    const amountMatch = recognizedText.match(/(\d+(\.\d+)?)(元|块|块钱)/)
    if (amountMatch) {
      amount = Number(amountMatch[1])
    } else {
      // 尝试直接提取数字
      const numMatch = recognizedText.match(/\d+(\.\d+)?/)
      if (numMatch) {
        amount = Number(numMatch[0])
      }
    }

    // 简单的关键词匹配提取分类
    let category = '其他'
    const expenseCategories = ['餐饮', '交通', '购物', '娱乐', '住房', '零食', '买菜']
    
    // 包含某些字就认为是该分类
    if (recognizedText.includes('饭') || recognizedText.includes('吃') || recognizedText.includes('水')) {
      category = '餐饮'
    } else if (recognizedText.includes('车') || recognizedText.includes('打车') || recognizedText.includes('地铁')) {
      category = '交通'
    } else if (recognizedText.includes('买') || recognizedText.includes('购物')) {
      category = '购物'
    }

    return {
      success: true,
      data: {
        text: recognizedText,
        amount: amount,
        category: category,
        type: 'expense' // 默认记为支出
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
