interface StoryPage {
  id: number;
  chapterTitle?: string;
  isContinuation: boolean;
  content: string;
  hasImage: boolean;
  imagePath?: string;
}

Page({
  data: {
    statusBarHeight: 20,
    navBarHeight: 64,
    pages: [
      {
        id: 1,
        chapterTitle: "第一章：老街里的蝉鸣",
        isContinuation: false,
        content: "那时候天总是不见黑，我记得老家后院有一棵巨大的枣树。每到夏天，我就跟着哥哥在树下粘蝉。那是我童年里最快乐的时光，风里都是泥土和草木的香气。我们总是拿着长长的竹竿，尖端抹上厚厚的面筋，屏住呼吸守在树干旁。",
        hasImage: true,
        imagePath: ""
      },
      {
        id: 2,
        chapterTitle: "第一章：老街里的蝉鸣",
        isContinuation: true,
        content: "除了粘蝉，最开心的就是去村口的河里扎猛子。水很清，能看见底下的鹅卵石。大人们总说河里有水怪，可我们这群孩子胆子大得很，不到肚皮打鼓绝对不肯上岸。如今回想起来，那清澈的河水似乎还在脚踝边流淌。",
        hasImage: false
      },
      {
        id: 3,
        chapterTitle: "第二章：第一封家书",
        isContinuation: false,
        content: "一九七五年，我坐上了去远方的火车。临行前，母亲往我包里塞了几个煮熟的鸡蛋。在那个没有手机的年代，书信是唯一的牵挂。每次写信，都要在油灯下琢磨很久很久，怕家里担心，只写报喜不报忧的话。",
        hasImage: true,
        imagePath: ""
      },
      {
        id: 4,
        chapterTitle: "第三章：奋斗的岁月",
        isContinuation: false,
        content: "工厂里的机器声从未停歇。年轻时的我，总觉得身上有使不完的劲。为了多挣一点加班费，经常在车间里熬通宵。那时候虽然累，但心里是有盼头的，总想着给家里换台黑白电视机。",
        hasImage: false
      },
      {
        id: 5,
        chapterTitle: "第四章：相识的那天",
        isContinuation: false,
        content: "那天的雨下得特别大。在车站的遮雨棚下，你递给了我半块毛巾。我们聊了一路，发现竟然都在同一片林场干过活。有时候缘分就是这么奇妙，一把伞，一双人，便是一辈子。",
        hasImage: true,
        imagePath: ""
      }
    ] as StoryPage[]
  },

  onLoad() {
    // 获取系统信息，计算状态栏高度
    const info = wx.getSystemInfoSync();
    const menuButton = wx.getMenuButtonBoundingClientRect();
    
    this.setData({
      statusBarHeight: info.statusBarHeight,
      // 导航栏高度 = 状态栏高度 + 44(微信默认导航栏高度)
      navBarHeight: info.statusBarHeight + 44 
    });
  },

  // 返回首页逻辑
  goHome() {
    wx.vibrateShort({ type: 'light' });
    // 使用 reLaunch 彻底回到首页，并销毁之前的 TabBar 状态
    wx.reLaunch({
      url: '/pages/index/index'
    });
  },

  uploadImg(e: any) {
    const index = e.currentTarget.dataset.index;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        const path = res.tempFiles[0].tempFilePath;
        const key = `pages[${index}].imagePath`;
        this.setData({ [key]: path });
        wx.showToast({ title: '照片已嵌入', icon: 'success' });
      }
    });
  },

  handleExport() {
    wx.showLoading({ title: '排版生成中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: 'PDF已保存至本地' });
    }, 2000);
  }
});