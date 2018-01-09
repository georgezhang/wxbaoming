var BasePage = require('./basepage')
var request = require('../utils/request')
var _ = require('../utils/lodash')
var $ = require('../utils/util')

module.exports = function(opt) {
    var _data = {
        initLoad: false,
        pages: null,
        page: null,
        projects: [],
        hasData: false,
        limitOfPerson: 0,
    }
    _.extend(opt.data || {}, _data)

    var _opt = {
        onLoad2: function(option) {
            var that = this
            return that.load()
                .then(function() {
                    return that.onLoad3(option)
                })
        },
        load: function() {
            var that = this
            that.showProgress()
            return request
                .get(that.data.url)
                .then(function(data) {
                    that.hideProgress()
                    if (data && data.docs && typeof data.docs == 'object' && data.docs.length > 0) {
                        that.setData({
                            hasData: true,
                            pages: data.pages,
                            page: data.page,
                            projects: that.formatProjects(data.docs)
                        })
                    }
                })
        },
        onShow: function() {
            if (!this.data.initLoad) {
                this.setData({
                    initLoad: true
                })
            } else {
                this.onLoad2(this.data.onLoadOption)
            }
        },
        formatProjects: function(docs) {
            var now = new Date()
            var projects = []
            _.each(docs, function(project) {
                projects.push({
                    _id: project._id,
                    title: project.title,
                    dueDate: $.df(project.dueDate),
                    status: $.getStatus(project, now),
                    limitOfPerson: $.getLimitOfPerson(project.limitOfPerson),
                    noOfPerson: project.noOfPerson || 0
                })
            })
            return projects
        },
        bindProjectDetailTap: function(evt) {
            if (evt && evt.currentTarget && evt.currentTarget.dataset && typeof evt.currentTarget.dataset.index != undefined) {
                var index = evt.currentTarget.dataset.index
                var project = this.data.projects[index]
                wx.navigateTo({
                    url: '../enrollment/enrollment?projectId=' + project._id
                })
            }
        },
    }

    _.extend(opt, _opt)
    BasePage(opt)
}
