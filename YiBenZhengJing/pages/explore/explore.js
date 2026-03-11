Page({
  data: {
    activeMaster: '', // 当前选中的大师风格ID
    pinnedWorks: [], // 置顶代表作数组
    allCommunityBooks: [], // 全部数据备份
    displayBooks: [] // 实际渲染的数据（被筛选后）
  },

  onLoad() {
    this.fetchCommunityData();
    // 页面加载时，默认展示所有 3 位大师的置顶作品
    this.setData({
      pinnedWorks: Object.values(this.getMasterpieces())
    });
  },

  // 模拟从后端拉取所有公开数据
  fetchCommunityData() {
    const mockFeed = [
      { id: 2001, title: '爷爷的铁道兵岁月', style: 'luxun', target: 'elder', authorName: '建国', excerpt: '那年冬天，我们在大兴安岭修铁路，雪下得齐腰深...', reads: '1.2w', likes: '342' },
      { id: 2002, title: '母亲的纺织厂时光', style: 'yangjiang', target: 'elder', authorName: '晓芬', excerpt: '厂房里的机器轰鸣声，伴随了她最美好的青春岁月，如今想来却十分安宁...', reads: '8.5k', likes: '128' },
      { id: 2003, title: '北大荒知青岁月', style: 'luxun', target: 'elder', authorName: '老刘', excerpt: '寒风像刀子一样割在脸上，但大家心里却燃着一团火...', reads: '2.3w', likes: '890' },
      { id: 2004, title: '看淡生死的晚年', style: 'jixianlin', target: 'elder', authorName: '李大爷', excerpt: '人生不过大梦一场，该经历的都经历了，也没什么可遗憾的...', reads: '5.1k', likes: '102' }
    ];

    this.setData({ 
      allCommunityBooks: mockFeed,
      displayBooks: mockFeed // 初始显示全部
    });
  },

  // 名家大作静态库 (模拟后端返回的置顶数据)
  getMasterpieces() {
    return {
      luxun: { id: 'm_luxun', title: '《朝花夕拾》节选', authorName: '鲁迅', excerpt: '我有一时，曾经屡次忆起儿时在故乡所吃的蔬果：菱角，罗汉豆，茭白，香瓜。凡这些，都是极其鲜美可口的...', reads: '10w+' },
      yangjiang: { id: 'm_yangjiang', title: '《我们仨》节选', authorName: '杨绛', excerpt: '我们这个家，很朴素；我们三个人，很单纯。我们与世无求，与人无争，只求相聚在一起...', reads: '10w+' },
      jixianlin: { id: 'm_jixianlin', title: '《杂忆与杂写》节选', authorName: '季羡林', excerpt: '每个人都争取一个完满的人生。然而，自古及今，海内海外，一个百分之百完满的人生是没有的...', reads: '10w+' }
    };
  },

  // 🌟 核心逻辑：点击大师卡片进行筛选和置顶
  filterByMaster(e) {
    const clickedId = e.currentTarget.dataset.id;
    const masterWorks = this.getMasterpieces();
    
    // 如果点击的是已经选中的，则取消筛选，恢复全部列表和全部置顶
    if (this.data.activeMaster === clickedId) {
      this.setData({
        activeMaster: '',
        pinnedWorks: Object.values(masterWorks), // 恢复3个置顶
        displayBooks: this.data.allCommunityBooks
      });
      return;
    }

    // 选中新的大师，更新置顶数据（仅留1个）并过滤列表
    const filteredList = this.data.allCommunityBooks.filter(book => book.style === clickedId);

    this.setData({
      activeMaster: clickedId,
      pinnedWorks: [masterWorks[clickedId]], // 数组里只塞被选中的这1个
      displayBooks: filteredList
    });
  },

  // 查阅详情 (支持大师代表作和素人作品)
  readBook(e) {
    const bookId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/preview/preview?bookId=${bookId}`
    });
  }
});
