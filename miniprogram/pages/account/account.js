import { supabase } from '../../utils/supabase'

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
    }
  },

  onLoad() {
    // Check login status
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo || !userInfo.user_id) {
      wx.redirectTo({ url: '/pages/login/login' })
    }
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
      const userInfo = wx.getStorageSync('userInfo')
      if (!userInfo || !userInfo.user_id) {
        wx.showToast({ title: '请先登录', icon: 'none' })
        setTimeout(() => {
          wx.navigateTo({ url: '/pages/login/login' })
        }, 1000)
        return
      }
      
      const { data, error } = await supabase.from('records').insert({
        user_id: userInfo.user_id,
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
  }
})
