import { supabase } from '../../utils/supabase'

Page({
  data: {
    username: '',
    password: '',
    isLoading: false
  },

  onLoad() {
    // 检查是否已经登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.user_id) {
      wx.switchTab({
        url: '/pages/account/account'
      })
    }
  },

  onUsernameInput(e) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e) {
    this.setData({ password: e.detail.value })
  },

  async handleRegister() {
    const { username, password } = this.data

    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    wx.showLoading({ title: '注册中...' })

    try {
      // 检查用户是否已存在
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', username)

      if (checkError) throw checkError

      if (existingUsers && existingUsers.length > 0) {
        wx.hideLoading()
        wx.showToast({ title: '用户名已存在', icon: 'none' })
        this.setData({ isLoading: false })
        return
      }

      // 插入新用户 (注意：实际生产环境中绝不能在客户端直接存明文密码，应使用 Supabase Auth)
      const { error: insertError } = await supabase.from('users').insert({
        id: username,
        password: password,
        nickname: username,
        avatar_url: 'https://picsum.photos/200'
      })

      if (insertError) throw insertError

      wx.hideLoading()
      wx.showToast({ title: '注册成功，请登录', icon: 'success' })
      this.setData({ isLoading: false })

    } catch (err) {
      wx.hideLoading()
      wx.showToast({ title: '注册失败', icon: 'none' })
      console.error('Register error:', err)
      this.setData({ isLoading: false })
    }
  },

  async handleLogin() {
    const { username, password } = this.data

    if (!username || !password) {
      wx.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }

    this.setData({ isLoading: true })
    wx.showLoading({ title: '登录中...' })

    try {
      // 验证用户名和密码
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', username)
        .eq('password', password)

      if (error) throw error

      if (!users || users.length === 0) {
        wx.hideLoading()
        wx.showToast({ title: '用户名或密码错误', icon: 'none' })
        this.setData({ isLoading: false })
        return
      }

      const user = users[0]

      // 更新最后登录时间
      await supabase.from('users').upsert({
        id: user.id,
        last_login: new Date().toISOString()
      })

      // 保存登录状态到本地
      const userInfo = {
        user_id: user.id,
        nickname: user.nickname,
        avatar: user.avatar_url
      }
      
      wx.setStorageSync('userInfo', userInfo)
      
      wx.hideLoading()
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 跳转到主页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/account/account'
        })
      }, 1000)

    } catch (err) {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败',
        icon: 'none'
      })
      console.error('Login error:', err)
      this.setData({ isLoading: false })
    }
  }
})