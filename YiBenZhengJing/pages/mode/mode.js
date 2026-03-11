const app = getApp();

// 引入我们刚才封装的全局 request 工具
import { request } from '../../utils/request';

Page({
  data: {
    targetAudience: '', 
    styleOptions: [],
    selectedStyle: '',
    isCreating: false // 防止用户狂点按钮发多条请求
  },

  onLoad() {
    const target = app.globalData.targetAudience || 'elder';
    this.setData({ targetAudience: target });

    // 🌟 动态获取文风配置：从你的 .NET 后端拉取
    this.fetchStylesFromServer(target);
  },

  // 调用后端接口获取动态文风列表
  async fetchStylesFromServer(target) {
    try {
      // ⚠️ 需要在你的 Admin.NET 后端写一个返回这些选项的接口
      const res = await request({
        url: '/api/bizConfig/ThemeStyles',
        method: 'GET',
        data: { targetAudience: target } // 传 elder 或 youth，让后端返回对应数据
      });
      
      this.setData({ styleOptions: res.result || [] });
    } catch (error) {
      console.error("拉取动态文风失败:", error);
      // 兜底方案：如果后端还没写好，用假数据顶上
    }
  },

  selectStyle(e) {
    const title = e.currentTarget.dataset.title;
    this.setData({ selectedStyle: title });
  },

  // 🌟 使用 async/await 极简重构连招逻辑
  async finishSetup() {
    if (!this.data.selectedStyle) {
      wx.showToast({ title: '请选择一种名家文风', icon: 'none' });
      return;
    }
    if (this.data.isCreating) return;

    this.setData({ isCreating: true });
    wx.showLoading({ title: '为您装订书册中...' });

    app.globalData.themeStyle = this.data.selectedStyle;
    const authorName = app.globalData.authorName || '神秘作者';
    // 1. 先从微信本地缓存中取出登录时存好的 OpenId
    const openId = wx.getStorageSync('OpenId'); 

    try {
      // 🔗 API 连招 1：更新用户信息
      await request({
        url: '/api/bizUser/profile',
        method: 'POST',
        data: { AuthorName: authorName,OpenId: openId }
      });

      // 🔗 API 连招 2：创建书本 (只有上一步 await 成功了，才会走到这里)
      const bookRes = await request({
        url: '/api/bizBook/book',
        method: 'POST',
        data: {
          AuthorName: app.globalData.draftBook.protagonistName, // 取草稿箱里的主人公
          Gender: app.globalData.draftBook.gender,              // 性别
          Age: parseInt(app.globalData.draftBook.age),          // 年龄
          TargetAudience: app.globalData.draftBook.target,
          ThemeStyle: this.data.selectedStyle
        }
      });

      // ... 前面创建书本的代码 ...
      wx.hideLoading();
      wx.showToast({ title: '创建成功!', icon: 'success' });
      
      // 保存书本 ID (你的后端应该返回了新建书本的 id)
      app.globalData.currentBookId = bookRes.result; 
      
      setTimeout(() => {
        // 🌟 修复 UX 瑕疵：不要回首页，直接进入聊天页开始创作！
        // 使用 redirectTo 防止用户点左上角返回又重复建书
        wx.redirectTo({ 
          url: `/pages/chat/chat?bookId=${bookRes.result}` 
        });
      }, 1000);
    } catch (error) {
      // 任何一步报错，都会自动跳到这里 (全局 request 已经处理了 Toast 提示)
      wx.hideLoading();
    }
  },

});