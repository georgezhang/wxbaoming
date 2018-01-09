//获取应用实例
var BasePage = require('../basepage')
BasePage({
    data: {
        projectId: null
    },
    onLoad2: function(option) {
        this.setData({
            projectId: option.projectId
        })
        this.afterPageLoad()
    },
    bindShareTap: function(evt) {
        wx.redirectTo({
            url: '../enrollment/enrollment?projectId=' + this.data.projectId
        })
    }
})
