//index.js
var BasePage = require('../basepage')

BasePage({
    data: {
        copyright_year: 2017,
    },
    onShareAppMessage: function() {
        return {
            title: '快乐报名',
            path: '/pages/index/index'
        }
    },
    bindStartProject: function() {
        wx.navigateTo({
            url: '../start_project/start_project'
        })
    },
    bindRecentProjects: function() {
        wx.navigateTo({
            url: '../recent_projects/recent_projects'
        })
    },
    onLoad2: function() {
        this.setData({
            copyright_year: (new Date()).getFullYear()
        })
        this.afterPageLoad()
    }
})
