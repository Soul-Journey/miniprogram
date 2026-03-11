// ==========================================
// 🌟 核心架构：全局路由守卫 (Global Route Guard)
// 原理：劫持微信原生 Page 构造函数，统一注入鉴权逻辑
// ==========================================
const originalPage = Page;

Page = function (pageConfig) {
  const originalOnLoad = pageConfig.onLoad;
  const originalOnShow = pageConfig.onShow;

  // 1. 劫持 onLoad (针对普通页面跳转)
  pageConfig.onLoad = function (options) {
    if (!checkAuth(this.route)) return; // 鉴权失败，直接打断渲染
    if (originalOnLoad) {
      originalOnLoad.call(this, options); // 鉴权成功，放行执行原来的 onLoad
    }
  };

  // 2. 劫持 onShow (针对 TabBar 页面切换，因为 TabBar 切换不触发 onLoad)
  pageConfig.onShow = function () {
    if (!checkAuth(this.route)) return;
    if (originalOnShow) {
      originalOnShow.call(this);
    }
  };

  originalPage(pageConfig);
};

// 🌟 统一的鉴权拦截判断逻辑
function checkAuth(currentRoute) {
  // 【白名单】不需要登录就能看的页面路径写在这里
  const whiteList = [
    'pages/login/login'
    // 如果你希望用户不登录也能看社区广场，就把 'pages/explore/explore' 取消注释加进来
  ];
  
  // 检查当前页面是否在白名单内
  if (!whiteList.includes(currentRoute)) {
    const token = wx.getStorageSync('AuthToken');
    if (!token) {
      console.warn(`🔒 路由拦截：拦截访问 [${currentRoute}]，重定向至登录页`);
      // 没有 Token，一律踢回登录页。使用 reLaunch 清空路由栈，防止点击返回键出 Bug
      wx.reLaunch({
        url: '/pages/login/login'
      });
      return false; // 返回 false 告诉页面停止继续加载
    }
  }
  return true; // 拥有 Token 或在白名单内，放行
}

// ==========================================
// 小程序全局实例 App
// ==========================================
App({
  onLaunch: function () {
    console.log("🚀 小程序启动，全局路由拦截器已成功挂载！");
  },

  // 存放跨页面共享的数据
  globalData: {
    authorName: '',       // 作者称呼
    targetAudience: '',   // elder:长辈 / youth:青年
    themeStyle: ''        // 具体的文风 (如：朝花夕拾风)
  }
});