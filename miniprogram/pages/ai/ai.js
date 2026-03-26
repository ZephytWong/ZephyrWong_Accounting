import { supabase } from '../../utils/supabase'

Page({
  data: {
    currentMonth: '',
    advices: []
  },

  onLoad() {
    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    this.setData({ currentMonth }, () => {
      this.fetchAiAdvice()
    })
  },

  onShow() {
    if (this.data.currentMonth) {
      this.fetchAiAdvice()
    }
  },

  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    }, () => {
      this.fetchAiAdvice()
    })
  },

  async fetchAiAdvice() {
    wx.showLoading({ title: 'AI分析中...' })
    const month = this.data.currentMonth
    const startDate = `${month}-01`
    
    let [year, m] = month.split('-')
    let nextMonth = parseInt(m) + 1
    let nextYear = parseInt(year)
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`

    try {
      const mockUserId = 'test-user-123'
      
      const { data: records, error } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', mockUserId)
        .gte('date', startDate)
        .lt('date', endDate)
        .limit(1000)

      if (error) throw error

      let totalIncome = 0
      let totalExpense = 0
      const categoryMap = {}

      if (records) {
        records.forEach(record => {
          const amount = Number(record.amount)
          if (record.type === 'income') {
            totalIncome += amount
          } else if (record.type === 'expense') {
            totalExpense += amount
            if (categoryMap[record.category]) {
              categoryMap[record.category] += amount
            } else {
              categoryMap[record.category] = amount
            }
          }
        })
      }

      // Generate mock advice based on Supabase data
      let advices = []

      if (totalExpense === 0) {
        advices.push("您本月还没有支出记录，继续保持良好的消费习惯！")
        advices.push("记得及时记录每一笔花销，让财务状况更清晰。")
      } else {
        if (totalExpense > totalIncome && totalIncome > 0) {
          advices.push("⚠️ 警告：本月支出已超过收入！请注意控制消费，避免债务累积。")
        } else if (totalExpense < totalIncome * 0.5) {
          advices.push("👍 您的储蓄率很高，可以考虑将部分闲置资金用于稳健型理财。")
        }

        let maxCategory = ''
        let maxAmount = 0
        for (const [cat, amt] of Object.entries(categoryMap)) {
          if (amt > maxAmount) {
            maxAmount = amt
            maxCategory = cat
          }
        }

        if (maxCategory) {
          advices.push(`📊 本月在【${maxCategory}】上花费最多（${maxAmount}元），可以审视一下这部分是否包含非必要支出。`)
        }

        if (categoryMap['餐饮'] && categoryMap['餐饮'] > totalExpense * 0.4) {
          advices.push("🍔 餐饮支出占比较高，尝试自己做饭可以省下不少钱哦。")
        }

        if (categoryMap['购物'] && categoryMap['购物'] > totalExpense * 0.3) {
          advices.push("🛍️ 购物支出较大，建议在下单前实施'冷却期'策略，避免冲动消费。")
        }
      }

      if (advices.length === 0) {
        advices.push("您的消费结构很健康，继续保持记账的好习惯！")
        advices.push("合理规划预算，让每一分钱都发挥价值。")
        advices.push("建立应急基金，以备不时之需。")
      }

      while (advices.length < 3) {
        advices.push("理财第一步是记账，坚持下去您会看到改变。")
      }

      wx.hideLoading()
      this.setData({ advices: advices.slice(0, 3) })

    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '请求失败', icon: 'none' })
      console.error('getAiAdvice fail', err)
    }
  }
})
