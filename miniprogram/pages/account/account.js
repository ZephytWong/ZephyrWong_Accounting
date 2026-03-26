import { supabase } from '../../utils/supabase'

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

  async saveRecord() {
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

    try {
      // For simplicity without auth, we use a mock user_id. In a real app, use wx.login and store openid
      const mockUserId = 'test-user-123'
      
      const { data, error } = await supabase.from('records').insert({
        user_id: mockUserId,
        amount: Number(amount),
        type: currentType,
        category: currentCategory,
        remark: remark,
        date: dateString
      })

      wx.hideLoading()
      
      if (error) {
        throw error
      }

      wx.showToast({
        title: '记账成功',
        icon: 'success'
      })
      this.setData({
        amount: '',
        remark: ''
      })
    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
      console.error('saveRecord fail', err)
    }
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
    
    // Instead of a cloud function, we'll do the simple parsing directly in the frontend
    // or simulate a call to an external ASR service.
    
    setTimeout(() => {
      wx.hideLoading()
      
      const recognizedText = "今天午饭花了25元" // Simulated ASR result
      
      let amount = 0
      const amountMatch = recognizedText.match(/(\d+(\.\d+)?)(元|块|块钱)/)
      if (amountMatch) {
        amount = Number(amountMatch[1])
      } else {
        const numMatch = recognizedText.match(/\d+(\.\d+)?/)
        if (numMatch) {
          amount = Number(numMatch[0])
        }
      }

      let category = '其他'
      if (recognizedText.includes('饭') || recognizedText.includes('吃') || recognizedText.includes('水')) {
        category = '餐饮'
      } else if (recognizedText.includes('车') || recognizedText.includes('打车') || recognizedText.includes('地铁')) {
        category = '交通'
      } else if (recognizedText.includes('买') || recognizedText.includes('购物')) {
        category = '购物'
      }

      wx.showToast({
        title: '识别成功',
        icon: 'success'
      })

      this.setData({
        amount: amount || this.data.amount,
        currentCategory: category || this.data.currentCategory,
        currentType: 'expense',
        remark: recognizedText
      })
    }, 1000)
  }
})
