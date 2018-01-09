//start_project.js
var BasePage = require('../basepage')
var dateFormat = require('../../utils/dateformat')
var request = require('../../utils/request')
var _ = require('../../utils/lodash')
var $ = require('../../utils/util')
var URL = require('../../const/URL')

function getItems(items) {
    var output = []
    _.each(items, function(item) {
        if (item.selected) {
            output.push(item.name)
        }
    })
    return output
}

BasePage({
    data: {
        projectId: null,
        title: null,
        address: null,
        startDate: null,
        startTime: null,
        endDate: null,
        endTime: null,
        description: null,
        firstAvailableDate: null,
        lastAvailableDate: null,
        dueDate: null,
        dueTime: null,
        limitOfPerson: 0,
        extraItems: [{
            name: '姓名',
            type: 'default',
            selected: false
        }, {
            name: '性别',
            type: 'default',
            selected: false
        }, {
            name: '年龄',
            type: 'default',
            selected: false
        }, {
            name: '手机',
            type: 'default',
            selected: false
        }, {
            name: '公司名称',
            type: 'default',
            selected: false
        }, {
            name: '部门',
            type: 'default',
            selected: false
        }, {
            name: '职位',
            type: 'default',
            selected: false
        }, {
            name: '学历',
            type: 'default',
            selected: false
        }, {
            name: '备注',
            type: 'default',
            selected: false
        }],
        timeZone: null,
        extra: [],
        errorMessage: '',
    },
    onLoad2: function(option) {
        var now = new Date();
        var next10Year = new Date(now.valueOf());
        next10Year.setFullYear(now.getFullYear() + 10);

        var that = this;
        if (option.projectId && ['edit', 'copy'].indexOf(option.action) != -1) {
            var projectId = option.projectId
            var action = option.action
            that.showProgress()
            return request
                .get(URL.myProjects + projectId)
                //load project
                .then(function(project) {
                    wx.hideNavigationBarLoading()
                    that.afterPageLoad()
                    if (action == 'edit') {
                        wx.setNavigationBarTitle({
                            title: '修改活动'
                        })
                    }
                    that.setData({
                        projectId: (action == 'edit' ? project._id : null),
                        title: project.title,
                        address: project.address || '未注明',
                        description: project.description || null,
                        limitOfPerson: project.limitOfPerson,
                        extraItems: $.reloadItems(that.data.extraItems, project.extra.items),
                        startDate: dateFormat(project.startDate, 'yyyy-mm-dd'),
                        startTime: dateFormat(project.startDate, 'HH:MM'),
                        endDate: dateFormat(project.endDate, 'yyyy-mm-dd'),
                        endTime: dateFormat(project.endDate, 'HH:MM'),
                        firstAvailableDate: dateFormat(now, 'yyyy-mm-dd'),
                        lastAvailableDate: dateFormat(next10Year, 'yyyy-mm-dd'),
                        dueDate: dateFormat(project.dueDate, 'yyyy-mm-dd'),
                        dueTime: dateFormat(project.dueDate, 'HH:MM'),
                        timeZone: dateFormat(now, 'Z'),
                    })
                    that.saveTmpData()
                    return project
                })
        } else {
            var tomorrow = new Date(now.valueOf());
            tomorrow.setDate(tomorrow.getDate() + 1);

            this.setData({
                startDate: dateFormat(now, 'yyyy-mm-dd'),
                startTime: dateFormat(now, 'HH:MM'),
                endDate: dateFormat(tomorrow, 'yyyy-mm-dd'),
                endTime: dateFormat(tomorrow, 'HH:MM'),
                firstAvailableDate: dateFormat(now, 'yyyy-mm-dd'),
                lastAvailableDate: dateFormat(next10Year, 'yyyy-mm-dd'),
                dueDate: dateFormat(tomorrow, 'yyyy-mm-dd'),
                dueTime: dateFormat(tomorrow, 'HH:MM'),
                timeZone: dateFormat(now, 'Z')
            })
            this.saveTmpData()
            this.afterPageLoad()
        }
    },
    onShow: function() {
        var tmpNewItem = this.app().getGlobalData('tmpNewItem')
        if (tmpNewItem) {
            this.data.extraItems.push({
                name: tmpNewItem,
                type: 'primary',
                selected: true
            })
            this.setData({
                extraItems: this.data.extraItems
            })
            this.saveTmpData()
            this.app().setGlobalData('tmpNewItem', null)
        }
    },
    onUnload: function() {
        this.app().setGlobalData('tmpExtraItems', null)
        this.app().setGlobalData('tmpNewItem', null)
    },
    saveTmpData: function() {
        var extraItems = this.data.extraItems
        var tmpExtraItems = []
        for (var i = 0, len = extraItems.length; i < len; i++) {
            tmpExtraItems.push(extraItems[i].name)
        }
        this.app().setGlobalData('tmpExtraItems', tmpExtraItems)
    },
    bindTitleInput: function(e) {
        this.setData({
            title: e.detail.value
        })
    },
    bindAddressInput: function(e) {
        this.setData({
            address: e.detail.value
        })
    },
    bindStartDateChange: function(e) {
        this.setData({
            startDate: e.detail.value,
            dueDate: e.detail.value
        })
    },
    bindStartTimeChange: function(e) {
        this.setData({
            startTime: e.detail.value,
            dueTime: e.detail.value
        })
    },
    bindEndDateChange: function(e) {
        this.setData({
            endDate: e.detail.value
        })
    },
    bindEndTimeChange: function(e) {
        this.setData({
            endTime: e.detail.value
        })
    },
    bindDescriptionInput: function(e) {
        this.setData({
            description: e.detail.value
        })
    },
    bindLimitOfPersonInput: function(e) {
        this.setData({
            limitOfPerson: parseInt(e.detail.value) || 0
        })
    },
    bindDueDateChange: function(e) {
        this.setData({
            dueDate: e.detail.value
        })
    },
    bindDueTimeChange: function(e) {
        this.setData({
            dueTime: e.detail.value
        })
    },
    bindItemTap: function(e) {
        if (e && e.currentTarget && e.currentTarget.dataset && typeof e.currentTarget.dataset.index != undefined) {
            var index = e.currentTarget.dataset.index
            var extraItems = this.data.extraItems
            var selected = extraItems[index].selected
            //toggle
            if (selected) {
                extraItems[index].selected = false
                extraItems[index].type = 'default'
            } else {
                extraItems[index].selected = true
                extraItems[index].type = 'primary'
            }
            this.setData({
                extraItems: extraItems
            })
        }
    },
    bindCustomItemTap: function(e) {
        wx.navigateTo({
            url: '../add_custom_item/add_custom_item'
        })
    },
    setError: function(errorMessage) {
        this.setData({
            errorMessage: errorMessage
        })
    },
    bindConfirmProject: function(e) {
        var that = this
        this.setData({
            errorMessage: ''
        })
        //标题
        var title = this.data.title
        if (!title || title.length < 1) {
            this.setError('必须填写标题')
            return
        }
        //说明
        var description = this.data.description
        if (!description || description.length < 1) {
            this.setError('必须填写内容，字数不能少于5')
            return
        }

        var postData = {}
        postData.title = this.data.title
        if (this.data.address) postData.address = this.data.address
        postData.startDate = new Date($.s(this.data.startDate) + ' ' + this.data.startTime + ' ' + this.data.timeZone)
        postData.endDate = new Date($.s(this.data.endDate) + ' ' + this.data.endTime + ' ' + this.data.timeZone)
        postData.dueDate = new Date($.s(this.data.dueDate) + ' ' + this.data.dueTime + ' ' + this.data.timeZone)
        if (this.data.description) postData.description = this.data.description
        postData.limitOfPerson = parseInt(this.data.limitOfPerson) || 0
        postData.extra = {}
        postData.extra.items = getItems(this.data.extraItems)

        //startDate > endDate
        if (postData.startDate > postData.endDate) {
            this.setError('活动开始时间不能晚于结束时间')
            return
        }
        //dueDate > endDate
        if (postData.dueDate > postData.endDate) {
            this.setError('报名截止时间不能晚于结束时间')
            return
        }

        var now = new Date()
        //dueDate < now
        if (postData.dueDate < now) {
            this.setError('报名截止时间要大于现在时间')
            return
        }
        //endDate < now
        if (postData.endDate < now) {
            this.setError('活动结束时间要大于现在时间')
            return
        }

        request
            .post(this.data.projectId ? (URL.myProjects + this.data.projectId) : URL.createProject, postData)
            .then(function(data) {
                wx.redirectTo({
                    url: '../start_project_confirmed/start_project_confirmed?projectId=' + data.projectId
                })
            })
            .catch(function(err) {
                that.setData({
                    errorMessage: err || '暂时不能发布活动，请稍后再试！'
                })
            })
    }
})
