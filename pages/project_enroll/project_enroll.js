var BasePage = require('../basepage')
var dateFormat = require('../../utils/dateformat')
var request = require('../../utils/request')
//var _ = require('../../utils/lodash')
var URL = require('../../const/URL')

BasePage({
    data: {
        hasData: false,
        emptyMessage: '暂时还没有人报名呢',
        url: URL.projectEnroll,
        enrollments: null,
    },
    onLoad2: function(option) {
        var that = this
        that.showProgress()
        return request
            .get(that.data.url + option.projectId)
            .then(function(data) {
                that.hideProgress()
                that.afterPageLoad()
                if (data && data.length > 0) {
                    that.setData({
                        hasData: true,
                        enrollments: data
                    })
                }
            })
    }
})
