Page({
  data: {
    currentMonth: '',
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    categoryData: [],
    // Cartoon style palette
    colors: ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF9F1C', '#A06CD5', '#FF99C8', '#42BFDD', '#C1FBA4']
  },

  onLoad() {
    const date = new Date()
    const currentMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    this.setData({ currentMonth }, () => {
      this.fetchReportData()
    })
  },

  onShow() {
    if (this.data.currentMonth) {
      this.fetchReportData()
    }
  },

  onMonthChange(e) {
    this.setData({
      currentMonth: e.detail.value
    }, () => {
      this.fetchReportData()
    })
  },

  fetchReportData() {
    wx.showLoading({ title: '加载中...' })
    wx.cloud.callFunction({
      name: 'getReportData',
      data: {
        month: this.data.currentMonth
      },
      success: res => {
        wx.hideLoading()
        if (res.result && res.result.success) {
          const data = res.result.data
          let { categoryData, totalExpense } = data
          
          // Calculate percentages
          categoryData = categoryData.map(item => {
            return {
              ...item,
              percent: totalExpense > 0 ? Math.round((item.value / totalExpense) * 100) : 0
            }
          })

          this.setData({
            totalIncome: data.totalIncome.toFixed(2),
            totalExpense: data.totalExpense.toFixed(2),
            balance: data.balance.toFixed(2),
            categoryData
          }, () => {
            if (categoryData.length > 0) {
              this.drawPieChart()
            }
          })
        } else {
          wx.showToast({ title: '获取数据失败', icon: 'none' })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({ title: '请求失败', icon: 'none' })
        console.error('getReportData fail', err)
      }
    })
  },

  drawPieChart() {
    const query = wx.createSelectorQuery()
    query.select('#pieCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)

        const width = res[0].width
        const height = res[0].height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 10

        const { categoryData, totalExpense, colors } = this.data

        ctx.clearRect(0, 0, width, height)

        let startAngle = -0.5 * Math.PI
        
        categoryData.forEach((item, index) => {
          const sliceAngle = (item.value / totalExpense) * 2 * Math.PI
          const endAngle = startAngle + sliceAngle

          ctx.beginPath()
          ctx.moveTo(centerX, centerY)
          ctx.arc(centerX, centerY, radius, startAngle, endAngle)
          ctx.closePath()
          ctx.fillStyle = colors[index % colors.length]
          ctx.fill()

          startAngle = endAngle
        })

        // Draw inner white circle for donut shape
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = '#ffffff'
        ctx.fill()
      })
  }
})
