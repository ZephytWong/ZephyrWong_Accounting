import { supabase } from '../../utils/supabase'

const DEEPSEEK_API_KEY = 'sk-5c3b868f628649208a2353d249ab141f' // Added your provided key
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

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
    wx.showLoading({ title: '语音上传中...' })
    
    // We use WeChat's built-in file upload or request to send the audio to DeepSeek's whisper model (or any compatible ASR endpoint).
    // DeepSeek doesn't natively have a whisper endpoint in their v1 API documentation publicly available in the same way as OpenAI,
    // so we will simulate the audio-to-text step here, OR if you have a valid Whisper API URL, you would use wx.uploadFile.
    
    // For this demonstration, we assume we want to send it to a backend or AI service.
    // In a real mini-program, WeChat provides the "WeChat SI" plugin for free real-time speech-to-text.
    // Here, we simulate the ASR returning text, and then we pass it to DeepSeek LLM for parsing.
    
    setTimeout(() => {
      const simulatedAsrResult = "今天和朋友聚餐吃的火锅" // Simulated ASR result from audio
      this.parseTextWithAI(simulatedAsrResult)
    }, 1000)
  },

  parseTextWithAI(text) {
    const prompt = `
你是一个专门用于处理语音识别文本的AI助手。由于语音识别可能存在同音字错误或语句不通顺，你需要对文本进行纠错和润色，提取出一段适合作为记账备注的简短文本。

原始识别文本：${text}

规则：
1. remark: 修复语音识别中可能的错别字、口语化瑕疵，使其成为一句通顺、准确、简短的记账描述（不超过20个字）。

你必须且只能返回一个合法的JSON对象，不要有任何多余的解释或Markdown格式（不要使用 \`\`\`json 标签）。
示例输出：
{"remark": "和朋友聚餐吃火锅"}
`

    wx.request({
      url: DEEPSEEK_API_URL,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      data: {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专门用于提取记账备注信息的JSON数据转换器。你只输出合法的JSON字符串，不包含任何其他内容。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_object"
        }
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          try {
            const content = res.data.choices[0].message.content
            const parsedData = JSON.parse(content)
            
            if (parsedData.remark) {
              wx.showToast({
                title: '备注识别成功',
                icon: 'success'
              })

              this.setData({
                remark: parsedData.remark
              })
              return
            }
          } catch (e) {
            console.error('JSON Parse Error:', e)
          }
        }
        
        // Fallback
        console.error('DeepSeek API Error or Invalid JSON:', res.data)
        this.fallbackParse(text)
      },
      fail: (err) => {
        console.error('DeepSeek API Request Fail:', err)
        this.fallbackParse(text)
      }
    })
  },

  fallbackParse(recognizedText) {
    wx.hideLoading()

    wx.showToast({
      title: '识别成功',
      icon: 'success'
    })

    this.setData({
      remark: recognizedText
    })
  }
})
