interface Memory {
  id: number;
  time: string;
  content: string;
}

Page({
  data: {
    currentQuestion: "奶奶，您小时候最爱玩什么？",
    isRecording: false,
    memories: [] as Memory[],
    lastId: ""
  },

  handleStartRecord() {
    this.setData({ isRecording: true });
    wx.vibrateShort({ type: 'medium' });
    console.log("TODO: 调用微信录音 API start()");
  },

  handleStopRecord() {
    this.setData({ isRecording: false });
    console.log("TODO: 调用微信录音 API stop()");
    this.mockApiResponse();
  },

  async mockApiResponse() {
    wx.showLoading({ title: 'AI 整理中...' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newId = Date.now();
    const newMemory: Memory = {
      id: newId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: "那时候我们在村口的老槐树下玩泥巴，虽然土多，但心里特别高兴。"
    };

    this.setData({
      memories: [...this.data.memories, newMemory],
      currentQuestion: "那这棵老槐树现在还在吗？",
      lastId: `item-${newId}`
    });

    wx.hideLoading();
  },

 // pages/elder/index.ts

  // ... 保持之前的接口和数据定义 ...

  navToBook() {
    console.log("正在切换至书稿预览 Tab");
    
    // 震动反馈
    wx.vibrateShort({ type: 'light' });

    // 核心变动：跳转 Tab 页面必须用 switchTab
    wx.switchTab({
      url: '/pages/book/index',
      success: () => {
        console.log("成功切换到预览书稿页面");
      },
      fail: (err) => {
        console.error("切换失败，请确认 app.json 中 pages/book/index 是否在 tabBar 列表里", err);
      }
    });
  }
});