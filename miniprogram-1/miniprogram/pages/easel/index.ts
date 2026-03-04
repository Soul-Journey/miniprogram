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

  // 1. 开始录音钩子
  handleStartRecord() {
    this.setData({ isRecording: true });
    wx.vibrateShort({ type: 'medium' });
    console.log("TODO: 调用微信录音 API start()");
  },

  // 2. 停止录音钩子
  handleStopRecord() {
    this.setData({ isRecording: false });
    console.log("TODO: 调用微信录音 API stop()");
    
    // 模拟一段后端返回的数据
    this.mockApiResponse();
  },

  // 3. API 请求预留位
  async mockApiResponse() {
    wx.showLoading({ title: 'AI 整理中...' });
    
    // 模拟网络延迟（Task.Delay）
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newId = Date.now();
    const newMemory: Memory = {
      id: newId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: "那时候我们在村口的老槐树下玩泥巴，虽然土多，但心里特别高兴。"
    };

    this.setData({
      memories: [...this.data.memories, newMemory],
      currentQuestion: "那这棵老槐树现在还在吗？", // 模拟 AI 追问逻辑
      lastId: `item-${newId}`
    });

    wx.hideLoading();
  }
});
