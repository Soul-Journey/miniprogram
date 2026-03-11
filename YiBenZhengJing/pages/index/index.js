const app = getApp();
import { request } from '../../utils/request'; // 引入封装的请求库

Page({
  data: {
    authorName: '',
    bookList: [], // 用户的书本列表
    // 🌟 新增：删除弹窗状态变量
    showDeleteModal: false,
    deleteCountdown: 3,
    bookToDelete: null
  },

  onShow() {
    // const savedName = wx.getStorageSync('AuthorName') || app.globalData.authorName || '新来的创作者';
    const savedName = wx.getStorageSync('CreatorName') || app.globalData.authorName || '新来的创作者';
    this.setData({ authorName: savedName });

    // 每次回到首页，都重新拉取最新数据
    this.fetchMyBooks();
  },

  // 🔗 使用全局封装拉取真实的后端数据
  async fetchMyBooks() {
    try {
      const res = await request({
        url: '/api/bizBook/myBooks',
        method: 'GET'
      });

      this.setData({ bookList: res.result || [] });
    } catch (error) {
      console.error("获取书架列表失败：", error);
      // request 工具中已经自动弹过 Toast，这里只需要静默处理即可
    }
  },
  // 1. 点击列表上的删除按钮，唤起自定义弹窗
  deleteBook(e) {
    const book = e.currentTarget.dataset.book;

    this.setData({
      showDeleteModal: true,
      bookToDelete: book,
      deleteCountdown: 3 // 重置倒计时为 3 秒
    });

    // 开启定时器
    this.deleteTimer = setInterval(() => {
      if (this.data.deleteCountdown > 0) {
        this.setData({ deleteCountdown: this.data.deleteCountdown - 1 });
      } else {
        clearInterval(this.deleteTimer); // 倒计时结束，清理定时器
      }
    }, 1000);
  },

  // 2. 取消删除 (我手滑了)
  closeDeleteModal() {
    if (this.deleteTimer) clearInterval(this.deleteTimer); // 销毁定时器
    this.setData({
      showDeleteModal: false,
      bookToDelete: null
    });
  },

  // 3. 倒计时结束后，点击确认销毁
  async confirmDelete() {
    if (this.data.deleteCountdown > 0) return; // 极致防呆：倒数没完坚决不让点

    const bookId = this.data.bookToDelete.id;
    this.closeDeleteModal(); // 先关闭弹窗

    wx.showLoading({ title: '彻底销毁中...' });

    try {
      // 呼叫后端删除接口
      await request({
        url: '/api/bizBook/delete',
        method: 'POST',
        data: { Id: bookId }
      });

      wx.hideLoading();
      wx.showToast({ title: '已彻底清除', icon: 'success' });

      // 重新拉取列表刷新页面
      this.fetchMyBooks();

    } catch (error) {
      wx.hideLoading();
      console.error("删除失败:", error);
    }
  },

  // 拦截底层页面的滚动 (当弹窗出现时)
  preventTouchMove() {
    return;
  },
  // 新建回忆录

  createNewBook() {
    wx.navigateTo({
      url: '/pages/onboarding/onboarding'
    });
  },

  // 继续创作：带上 bookId 进入聊天页
  openBook(e) {
    const book = e.currentTarget.dataset.book;

    app.globalData.currentBookId = book.id;
    app.globalData.targetAudience = book.target;
    app.globalData.themeStyle = book.style;

    wx.navigateTo({
      url: `/pages/chat/chat?bookId=${book.id}`
    });
  },

  // 预览排版
  previewBook(e) {
    const book = e.currentTarget.dataset.book;
    wx.navigateTo({
      url: `/pages/preview/preview?bookId=${book.id}`
    });
  }
});
