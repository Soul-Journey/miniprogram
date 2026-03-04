// pages/index/index.ts
Page({
  // ... 其他代码

  navToElder() {
    // 1. 先弹个提示（可选）
    wx.showToast({ title: '加载中...', icon: 'loading', duration: 500 });

    // 2. 核心：使用 switchTab 跳转到 TabBar 页面
    wx.switchTab({
      url: '/pages/elder/index',
      success: () => {
        console.log("跳转成功");
      },
      fail: (err) => {
        console.error("跳转失败，请检查 app.json 中是否配置了该页面", err);
      }
    });
  },

  navToYouth() {
    wx.switchTab({
      url: '/pages/youth/index'
    });
  }
});
