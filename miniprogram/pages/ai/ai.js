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

  fetchAiAdvice() {
    wx.showLoading({ title: 'AI分析中...' })
    wx.cloud.callFunction({
      name: 'getAiAdvice',
      data: {
        month: this.data.currentMonth
      },
      success: res => {
        wx.hideLoading()
        if (res.result && res.result.success) {
          this.setData({
            advices: res.result.data.advices || []
          })
        } else {
          wx.showToast({ title: '获取建议失败', icon: 'none' })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '请求失败', icon: 'none' })
        console.error('getAiAdvice fail', err)
      }
    })
  }
})
