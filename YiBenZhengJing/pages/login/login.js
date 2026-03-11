import { request } from '../../utils/request';

Page({
  data: { isLoading: false, isAgreed: false },

  toggleAgreement() { this.setData({ isAgreed: !this.data.isAgreed }); },

  async handleWechatLogin() {
    if (!this.data.isAgreed) {
      wx.showToast({ title: '请先阅读并勾选协议', icon: 'none' }); return;
    }
    if (this.data.isLoading) return;
    
    this.setData({ isLoading: true });
    wx.showLoading({ title: '获取凭证中...' });

    try {
      // ==========================================
      // 【第一步】：将原生的 wx.login 封装为 Promise，以便使用 await
      // ==========================================
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: res => res.code ? resolve(res) : reject(new Error('获取Code失败')),
          fail: err => reject(err)
        });
      });
      
      console.log("1. 获取到微信 Code:", loginRes.code);

      // ==========================================
      // 【第二步】：用 code 换取 OpenId
      // ==========================================
      const openIdApiRes = await request({
        url: '/api/sysWxOpen/wxOpenId',
        method: 'GET',
        data: { jsCode: loginRes.code }
      });

      // 从统一结果 result 里提取 OpenId
      const openIdStr = openIdApiRes.result.openId || openIdApiRes.result.OpenId;
      console.log("2. 成功换取到 OpenId:", openIdStr);
      wx.showLoading({ title: '正在登录...' });

      // ==========================================
      // 【第三步】：拿着 OpenId 请求登录换取 Token
      // ==========================================
      const loginApiRes = await request({
        url: '/api/sysWxOpen/wxOpenIdLogin',
        method: 'POST',
        data: { openId: openIdStr }
      });

      console.log("3. 登录成功，获取到 Token!");
      const token = loginApiRes.result.accessToken;
      
      // 存入本地缓存
      wx.setStorageSync('AuthToken', token);
      wx.setStorageSync('OpenId', openIdStr);
      
      wx.showToast({ title: '登录成功', icon: 'success' });
      
      // ==========================================
      // 架构升级：新老用户智能路由分发
      // ==========================================
      const hasCompletedProfile = wx.getStorageSync('HasProfile');

      setTimeout(() => {
        if (!hasCompletedProfile) {
          // 新用户：跳转到信息收集页 (Onboarding)
          wx.navigateTo({ url: '/pages/onboarding/onboarding' });
        } else {
          // 老用户：直接跳转到主页广场 (Explore/Index)
          wx.switchTab({ url: '/pages/explore/explore' });
        }
        this.setData({ isLoading: false });
      }, 1000);

    } catch (error) {
      console.error("登录流程异常", error);
      wx.hideLoading();
      // 若是 request 抛出的错，已经在全局处理过 toast 了
      this.setData({ isLoading: false });
    }
  }
});
