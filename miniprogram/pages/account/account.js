const recorderManager = wx.getRecorderManager()

Page({
  data: {
    currentType: 'expense',
    amount: '',
    remark: '',
    currentCategory: '餐饮',
    categories: {
      expense: [
        { name: '餐饮', icon: '🍔' },
        { name: '交通', icon: '🚌' },
        { name: '购物', icon: '🛍️' },
        { name: '娱乐', icon: '🎬' },
        { name: '住房', icon: '🏠' },
        { name: '零食', icon: '🍫' },
        { name: '买菜', icon: '🥬' },
        { name: '其他', icon: '📦' }
      ],
      income: [
        { name: '工资', icon: '💰' },
        { name: '兼职', icon: '💼' },
        { name: '理财', icon: '📈' },
        { name: '其他', icon: '🧧' }
      ]
    },
    isRecording: false
  },

  onLoad() {
    recorderManager.onStop((res) => {
      this.handleVoiceRecord(res.tempFilePath)
    })
  },

  switchType(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      currentType: type,
      currentCategory: this.data.categories[type][0].name
    })
  },

  onAmountInput(e) {
    this.setData({
      amount: e.detail.value
    })
  },

  selectCategory(e) {
    this.setData({
      currentCategory: e.currentTarget.dataset.category
    })
  },

  onRemarkInput(e) {
    this.setData({
      remark: e.detail.value
    })
  },

  saveRecord() {
    const { amount, currentType, currentCategory, remark } = this.data

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      wx.showToast({
        title: '请输入有效金额',
        icon: 'none'
      })
      return
    }

    wx.showLoading({ title: '保存中...' })

    const date = new Date()
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    wx.cloud.callFunction({
      name: 'createRecord',
      data: {
        amount: Number(amount),
        type: currentType,
        category: currentCategory,
        remark: remark,
        date: dateString
      },
      success: res => {
        wx.hideLoading()
        if (res.result && res.result.success) {
          wx.showToast({
            title: '记账成功',
            icon: 'success'
          })
          this.setData({
            amount: '',
            remark: ''
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        })
        console.error('saveRecord fail', err)
      }
    })
  },

  startRecord() {
    this.setData({ isRecording: true })
    recorderManager.start({
      format: 'mp3'
    })
  },

  stopRecord() {
    this.setData({ isRecording: false })
    recorderManager.stop()
  },

  handleVoiceRecord(tempFilePath) {
    wx.showLoading({ title: '识别中...' })
    
    // We can upload the file or directly call the mock function.
    // The provided cloud function accepts `audioFile` or `text`.
    wx.cloud.callFunction({
      name: 'speechToText',
      data: {
        // mock text can be passed or left empty to use cloud function's default "今天午饭花了25元"
        text: ''
      },
      success: res => {
        wx.hideLoading()
        if (res.result && res.result.success) {
          const { amount, category, type, text } = res.result.data
          
          wx.showToast({
            title: '识别成功',
            icon: 'success'
          })

          this.setData({
            amount: amount || this.data.amount,
            currentCategory: category || this.data.currentCategory,
            currentType: type || this.data.currentType,
            remark: text || ''
          })
        } else {
          wx.showToast({
            title: '识别失败',
            icon: 'none'
          })
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.showToast({
          title: '请求失败',
          icon: 'none'
        })
        console.error('speechToText fail', err)
      }
    })
  }
})
