// utils/request.js

// 🌍 全局统一配置
const BASE_URL = 'https://localhost:44325';

/**
 * 封装微信的 wx.request 为 Promise，支持 async/await
 * @param {Object} options 请求配置参数
 */
export const request = (options) => {
  return new Promise((resolve, reject) => {
    // 自动获取本地的 AuthToken
    const token = wx.getStorageSync('AuthToken');
    
    // 组装 Header
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    };

    // 如果有 Token，自动塞入请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: header,
      success: (res) => {
        // 🌟 统一状态码拦截 (Admin.NET 成功默认是 200)
        if (res.data.code === 200) {
          resolve(res.data); // 只将有用的业务数据抛出
        } 
        else if (res.data.code === 401) {
          // Token 失效或未登录，全局统一拦截，强制踢回登录页
          wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
          wx.removeStorageSync('AuthToken');
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/login/login' });
          }, 1500);
          reject(new Error('未授权'));
        } 
        else {
          // 业务级别报错 (如参数错误等)
          wx.showToast({ title: res.data.message || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: (err) => {
        // 网络级别的报错 (如服务器宕机、断网)
        wx.showToast({ title: '网络连接异常', icon: 'none' });
        reject(err);
      }
    });
  });
};