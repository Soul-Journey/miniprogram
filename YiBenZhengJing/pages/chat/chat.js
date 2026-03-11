import { request } from '../../utils/request';
const app = getApp();

Page({
  data: {
    targetAudience: 'elder',
    authorName: '爷爷/奶奶',
    themeStyle: '温情纪实风',
    isRecording: false,
    isAITyping: false,
    scrollToId: '',
    messages: [],
    
    // 🌟 新增：章节状态管理
    currentChapterIndex: 1,
    currentChapterTitle: '第一章：童年的泥巴与炊烟'
  },

  onLoad(options) {
    if (app.globalData) {
      this.setData({
        targetAudience: app.globalData.targetAudience || 'elder',
        authorName: app.globalData.authorName || '朋友',
        themeStyle: app.globalData.themeStyle || '温情纪实风'
      });
      
      // 发送初始破冰欢迎语
      this.sendInitialGreeting();
    }
  },

  sendInitialGreeting() {
    this.setData({ isAITyping: true });
    setTimeout(() => {
      const msg = {
        id: Date.now(),
        role: 'ai',
        type: 'text',
        content: `您好呀，${this.data.authorName}！咱们的回忆录正式开笔啦。现在正在收集【${this.data.currentChapterTitle}】的素材。您小时候住在哪里？家里兄弟姐妹多吗？`,
        isLoading: false
      };
      this.setData({ 
        messages: [msg],
        isAITyping: false,
        scrollToId: `msg-${msg.id}`
      });
    }, 1000);
  },

  // 上传照片 (保持不变)
  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        this.processUserMedia(tempFilePath, 'image');
      }
    });
  },

  async processUserMedia(filePath, type) {
    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;
    
    this.setData({ 
      messages: [...this.data.messages, { id: userMsgId, role: 'user', content: filePath, type: type }, { id: aiMsgId, role: 'ai', content: '', type: 'text', isLoading: true }],
      scrollToId: `msg-${aiMsgId}`,
      isAITyping: true
    });

    setTimeout(() => {
      const updatedMessages = this.data.messages.map(msg => msg.id === aiMsgId ? { ...msg, content: "这张老照片真有年代感！照片里除了您，还有谁呢？", isLoading: false } : msg);
      this.setData({ messages: updatedMessages, scrollToId: `msg-${aiMsgId}`, isAITyping: false });
    }, 2000);
  },

  // 🌟 录音与方言识别流程 (增加确认与修改机制)
  startRecord() { 
    if (this.data.isAITyping) return; 
    wx.vibrateShort(); 
    this.setData({ isRecording: true }); 
  },
  
  cancelRecord() { this.setData({ isRecording: false }); },
  
  stopRecord() {
    if (!this.data.isRecording) return;
    this.setData({ isRecording: false });
    
    wx.showLoading({ title: 'AI 识别声音中...' });

    // 模拟后端 ASR 识别出的文字
    setTimeout(() => {
      wx.hideLoading();
      const asrResultText = "我小时候在乡下，家里穷，天天满山跑。";
      
      // 🌟 核心体验：弹出可编辑确认框，防错别字
      wx.showModal({
        title: '请确认您的话 (可修改)',
        content: asrResultText,
        editable: true, // 开启原生输入框
        placeholderText: '如有错别字可在此修改',
        confirmText: '确认发送',
        cancelText: '重说',
        success: (res) => {
          if (res.confirm) {
            // 用户点击确认，取修改后的值（如果未修改则取原值）
            const finalContent = res.content || asrResultText;
            
            // 🌟 核心变更：把确认后的文字发给后端大模型
            this.sendTextToBackend(finalContent); 
          } else if (res.cancel) {
            // 用户点击重说，什么都不做，重新按语音按钮即可
            wx.showToast({ title: '已取消发送', icon: 'none' });
          }
        }
      });
    }, 1000);
  },

  // 🌟 新增：真正发送数据到后端的函数
  async sendTextToBackend(text) {
    if (!text || this.data.isAITyping) return;
    
    // 1. 用户的消息上屏，并显示 AI 的 Loading 动画
    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;
    this.setData({ 
      messages: [...this.data.messages, { id: userMsgId, role: 'user', content: text, type: 'text' }, { id: aiMsgId, role: 'ai', content: '', type: 'text', isLoading: true }],
      scrollToId: `msg-${aiMsgId}`,
      isAITyping: true
    });

    try {
      const token = wx.getStorageSync('AuthToken');
      // 2. 调用真正的 .NET 后端接口
      const res = await request({
        url: '/api/chat/sendMessage', // 假设你后端的接口地址是这个
        method: 'POST',
        header: { 'Authorization': `Bearer ${token}` },
        data: {
          BookId: app.globalData.currentBookId,
          ChapterIndex: this.data.currentChapterIndex,
          Text: text 
        }
      });
      
      // 3. 拿到后端大模型的回复后，更新页面
      const aiResponse = res.result; // 假设你的后端接口返回的内容在 result 里
      
      const updatedMessages = this.data.messages.map(msg => msg.id === aiMsgId ? { ...msg, content: aiResponse, isLoading: false } : msg);
      this.setData({ messages: updatedMessages, scrollToId: `msg-${aiMsgId}`, isAITyping: false });

    } catch (error) {
      console.error("调用后端聊天接口失败:", error);
      // 报错处理：移除刚才的 Loading 气泡
      const errorMessages = this.data.messages.filter(msg => msg.id !== aiMsgId);
      this.setData({ messages: errorMessages, isAITyping: false });
      wx.showToast({ title: '网络异常，发送失败', icon: 'none' });
    }
  },

  // (保留原本的 processUserMessage 作为兼容，或者你也可以删掉它)
  async processUserMessage(text) {
    this.sendTextToBackend(text); 
  },

  async processUserMessage(text) {
    if (!text || this.data.isAITyping) return;
    const userMsgId = Date.now();
    const aiMsgId = userMsgId + 1;
    this.setData({ 
      messages: [...this.data.messages, { id: userMsgId, role: 'user', content: text, type: 'text' }, { id: aiMsgId, role: 'ai', content: '', type: 'text', isLoading: true }],
      scrollToId: `msg-${aiMsgId}`,
      isAITyping: true
    });

    setTimeout(() => {
      const updatedMessages = this.data.messages.map(msg => msg.id === aiMsgId ? { ...msg, content: `（记者 AI）：听起来那是一段无忧无虑的日子呀！那时候满山跑，有什么特别好玩的游戏吗？`, isLoading: false } : msg);
      this.setData({ messages: updatedMessages, scrollToId: `msg-${aiMsgId}`, isAITyping: false });
    }, 1500);
  },

  // 🌟 新增：长按撤回消息功能
  recallMessage(e) {
    const msgId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '撤回消息',
      content: '确定要删除这句话吗？删除后 AI 将不会把它写进书里。',
      confirmColor: '#EA580C',
      success: (res) => {
        if (res.confirm) {
          // 在前端数组中剔除这条消息
          const newMessages = this.data.messages.filter(msg => msg.id !== msgId);
          this.setData({ messages: newMessages });
          
          // TODO: 真实项目中，这里还需要调用 .NET 后端接口删除数据库里的记录
          wx.showToast({ title: '已撤回', icon: 'success' });
        }
      }
    });
  },

  // 🌟 升级：笔录成文 (触发大模型 B，并推进章节)
  generateChapter() {
    if (this.data.messages.length < 2) {
      wx.showToast({ title: '再多聊几句吧，素材还不够丰富哦', icon: 'none' });
      return;
    }

    wx.showModal({
      title: '本章结稿',
      content: `确认【${this.data.currentChapterTitle}】回忆完毕？系统将用${this.data.themeStyle}为您排版成文。`,
      confirmColor: '#EA580C',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '作家 AI 排版中...' });
          
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({ title: '本章生成完毕！', icon: 'success' });
            
            // 🌟 核心逻辑：章节推进
            this.setData({
              currentChapterIndex: 2,
              currentChapterTitle: '第二章：青春的汗水与远方',
              messages: [] // 清空聊天记录，开启新一轮纯净对话
            });

            // 记者 AI 发起新一章的提问
            setTimeout(() => {
              const msg = {
                id: Date.now(),
                role: 'ai',
                type: 'text',
                content: `上一个章节已经完美收录到您的书架啦！现在咱们进入【第二章】。离开家乡或者刚参加工作时，您还记得第一份工作是什么吗？`,
                isLoading: false
              };
              this.setData({ 
                messages: [msg],
                scrollToId: `msg-${msg.id}`
              });
            }, 500);

          }, 2500);
        }
      }
    });
  }
});