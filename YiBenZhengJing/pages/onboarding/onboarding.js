const app = getApp();

Page({
  data: {
    authorName: '',     // 这里的语境变为了：当前新书的“主人公姓名”
    authorGender: '',   // 主人公性别
    authorAge: '',      // 主人公年龄
    currentTarget: '',  
    isOldUser: false
  },

  onLoad(options) {
    // 判断是否是老用户从首页点击“新建回忆录”进来的
    if (options.isNewBook === 'true') {
      this.setData({ 
        isOldUser: true
        // 🌟 关键修复：不再从缓存里拉取旧名字填充！
        // 新建书本时，让输入框保持空白，方便用户为新主人公填信息
      });
      wx.setNavigationBarTitle({ title: '新建回忆录' });
    }
  },

  handleNameInput(e) { 
    this.setData({ authorName: e.detail.value }); 
  },
  
  handleAgeInput(e) { 
    // 强制过滤，只允许输入数字
    let value = e.detail.value.replace(/\D/g, ''); 
    this.setData({ authorAge: value }); 
    return value; // 返回给原生 input，确保视图上只显示数字
  },

  selectGender(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ authorGender: gender });
  },
  
  selectTarget(e) {
    const selectedTarget = e.currentTarget.dataset.target;
    this.setData({ currentTarget: selectedTarget });
  },

  handleNext() {
    // 🌟 关键修复：无论新老用户新建书，都必须校验主人公信息
    if (!this.data.authorName.trim()) {
      wx.showToast({ title: '请填写主人公称呼', icon: 'none' }); return;
    }
    if (!this.data.authorGender) {
      wx.showToast({ title: '请选择性别', icon: 'none' }); return;
    }
    if (!this.data.authorAge || isNaN(this.data.authorAge)) {
      wx.showToast({ title: '请输入正确的数字年龄', icon: 'none' }); return;
    }
    if (!this.data.currentTarget) {
      wx.showToast({ title: '请选择制作对象', icon: 'none' }); return;
    }

    // ==========================================
    // 🌟 核心逻辑分离：剥离“账号主人”和“本书主人公”
    // ==========================================

    // 1. 如果是第一次登录的全新用户，顺便把第一个名字设为首页的“创作者名称”
    if (!this.data.isOldUser && !wx.getStorageSync('HasProfile')) {
      wx.setStorageSync('HasProfile', true);
      // 存一个专门代表创作者名字的 Key，永远不被后续的新书覆盖
      wx.setStorageSync('CreatorName', this.data.authorName); 
      app.globalData.authorName = this.data.authorName; // 给首页打招呼用
    }

    // 2. 将当前填写的【主人公信息】存入一个专属的【草稿箱变量】，绝不覆盖账号信息
    app.globalData.draftBook = {
      protagonistName: this.data.authorName, // 传给后端的书本主人公
      gender: this.data.authorGender,        // 传给后端的性别
      age: this.data.authorAge,              // 传给后端的年龄
      target: this.data.currentTarget
    };

    // 3. 兼容一下老代码的受众变量
    app.globalData.currentTarget = this.data.currentTarget;

    wx.navigateTo({ url: '/pages/mode/mode' });
  }
});