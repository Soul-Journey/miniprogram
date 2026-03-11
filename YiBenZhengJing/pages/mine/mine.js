const app = getApp();

Page({
  data: {
    authorName: '神秘作者'
  },

  onShow() {
    if (app.globalData && app.globalData.authorName) {
      this.setData({ authorName: app.globalData.authorName });
    }
  },

  // 允许用户在“我的”页面重新跳转去收集页，更换角色
  switchMode() {
    wx.showModal({
      title: '切换模式',
      content: '确认要重新选择创作模式吗？',
      success: (res) => {
        if (res.confirm) {
          wx.reLaunch({
            url: '/pages/onboarding/onboarding'
          });
        }
      }
    });
  }
});
