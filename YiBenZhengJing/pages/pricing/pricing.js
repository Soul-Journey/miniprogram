Page({
  handlePay(e) {
    const tier = e.currentTarget.dataset.tier;
    
    // 此处预留调用 .NET 后端生成微信支付订单的逻辑
    wx.showLoading({ title: '拉取支付...' });
    
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: '温馨提示',
        content: `这是演示版本，您选择的是 ${tier} 元套餐。真实项目中将拉起微信支付。`,
        showCancel: false
      });
    }, 800);
  }
});