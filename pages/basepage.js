var _ = require('../utils/lodash')
var base = require('../utils/base')
var isStart = false
var count = 0

module.exports = function(opt) {
    var _data = {
        onLoadOption: null,
        progress_percent: 0,
        progress_hidden: true,
        isPageLoading: true
    }
    _.extend(opt.data || {}, _data)

    var _opt = {
        showProgress: function() {
            count++
            if (!isStart) {
                isStart = true
                this.setData({
                    progress_percent: 98,
                    progress_hidden: false
                })
            }
        },
        hideProgress: function() {
            if (count > 0) count--
                if (count == 0) {
                    this.setData({
                        progress_percent: 100
                    })
                    this.setData({
                        progress_hidden: true
                    })
                    isStart = false
                }
        },
        onLoad: function(option) {
            var that = this
            that.setData({
                onLoadOption: option
            })
            that.showProgress()
            that.app().getUserInfo()
                .then(function() {
                    that.hideProgress()
                    that.onLoad2(option)
                })
        },
        onPullDownRefresh: function() {
            var result = this.onLoad2(this.data.onLoadOption)
            if (result && (typeof result == 'object' || typeof result == 'function') && typeof result.then == 'function') {
                result
                    .then(function() {
                        wx.stopPullDownRefresh()
                    })
            } else {
                wx.stopPullDownRefresh()
            }

        },
        afterPageLoad: function() {
            this.setData({
                isPageLoading: false
            })
        }
    }

    _.extend(opt, _opt, base)
    Page(opt)
}
