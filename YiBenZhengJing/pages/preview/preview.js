Page({
  data: {
    bookTitle: '爷爷的铁道兵岁月',
    authorName: '建国',
    themeStyle: '温情纪实风',
    currentPage: 0, // 记录当前翻到了哪一页
    bookPages: []   // 🌟 升级为分页二维数据结构
  },

  onLoad(options) {
    // 实际项目中会根据 options.bookId 向 .NET 后端请求分页好的排版数据
    // 这里我们模拟一本包含 3 页的迷你回忆录
    this.setData({
      bookPages: [
        {
          chapterTitle: '第一章：风雪大兴安岭',
          blocks: [
            { 
              type: 'text', 
              isDropCap: true, // 开启首字下沉
              content: "那年冬天，我们在大兴安岭修铁路，雪下得齐腰深。铁锹一铲下去，震得虎口生疼，可没人喊苦。连长把唯一的棉大衣脱下来，盖在了发高烧的新兵战友身上，自己冻得直打哆嗦，还笑着跟我们打趣。" 
            }
          ]
        },
        {
          // 没有 chapterTitle，代表是同一章的延续
          blocks: [
            { 
              type: 'image', 
              url: "[https://picsum.photos/id/1015/800/600](https://picsum.photos/id/1015/800/600)", 
              caption: "1975年，大兴安岭，连队合影" 
            },
            { 
              type: 'text', 
              content: "后来通车那天，大家都哭了。不是因为冷，也不是因为累，是因为这辈子干了件轰轰烈烈的大事，觉得值了。火车鸣笛的那一刻，声音响彻了整片雪原。" 
            }
          ]
        },
        {
          chapterTitle: '第二章：岁月的沉淀',
          blocks: [
            { 
              type: 'text', 
              isDropCap: true,
              content: "如今老战友们大都不在了，有些话，再不说可能就真的一起埋在土里了。借着这个机会，我想把那些沾着雪和汗的日子，一笔一划地记下来，留给后辈们看看。这也是我这辈子，留给子孙最宝贵的财富。" 
            }
          ]
        }
      ]
    });
  },

  // 监听滑块滑动事件
  onPageChange(e) {
    this.setData({
      currentPage: e.detail.current
    });
  },

  // 极具吸引力的变现入口，直通定价页
  goToPrint() {
    wx.switchTab({
      url: '/pages/pricing/pricing'
    });
  }
});