//获取应用实例
var BasePage = require('../basepage')
var request = require('../../utils/request')
var URL = require('../../const/URL')
var $ = require('../../utils/util')
var _ = require('../../utils/lodash')

BasePage({
    data: {
        avatarUrl: null,
        nickName: null,
        project: null,
        extraItems: null,
        available: false,
        noOfPerson: 1,
        errorMessage: " ",
        joined: false,
        isOwner: false,
        enrollments: null
    },
    onShareAppMessage: function() {
        return {
            title: (this.data.project.title || ''),
            path: this.data.project._id ? ('/pages/enrollment/enrollment?projectId=' + this.data.project._id) : '/pages/index/index'
        }
    },
    onLoad2: function(option) {
        wx.showNavigationBarLoading()
        var that = this
        var userInfo = this.app().globalData.userInfo
        that.setData({
            avatarUrl: userInfo.avatarUrl,
            nickName: userInfo.nickName
        })

        var projectId

        if (option.qr && option.qr.length > 30) {
            projectId = option.qr
        } else {
            projectId = option.projectId
        }
        if (projectId) {
            var now = new Date()
            that.showProgress()
            return request
                .get(URL.myProjects + projectId + '?avatarUrls=true')
                //load project
                .then(function(project) {
                    wx.hideNavigationBarLoading()
                    that.afterPageLoad()
                    wx.setNavigationBarTitle({
                        title: project.title
                    })
                    that.setData({
                        project: {
                            _id: project._id,
                            title: project.title,
                            dueDate: $.df(project.dueDate),
                            status: $.getStatus(project, now),
                            limitOfPerson: $.getLimitOfPerson(project.limitOfPerson),
                            noOfPerson: project.noOfPerson || 0,
                            startDate: $.dtf(project.startDate),
                            endDate: $.dtf(project.endDate),
                            address: project.address || '未注明',
                            description: project.description,
                            qrcode: project.qrcode,
                        },
                        extraItems: $.ef(project.extra),
                        available: $.getAvailable(project, now),
                        isOwner: project.isOwner || false,
                        enrollments: project.enrollments
                    })
                    return project
                })
                //load enrollment
                .then(function(project) {
                    if (project.status != 1) {
                        that.hideProgress()
                    } else {
                        request
                            .get(URL.enroll + projectId)
                            .then(function(enrollment) {
                                that.hideProgress()
                                if (enrollment) {
                                    var extraItems = that.data.extraItems
                                    that.setData({
                                        noOfPerson: enrollment.noOfPerson || that.data.noOfPerson,
                                        extraItems: $.mergeItems(extraItems, enrollment.extra),
                                        joined: true,
                                    })
                                }

                            })
                    }
                })
                .catch(() => {
                    wx.hideNavigationBarLoading()
                    that.afterPageLoad()
                })
        }
    },

    bindNoOfPersonInput: function(evt) {
        if (evt && evt.detail && evt.detail.value) {
            var value = parseInt(evt.detail.value) || false
            if (value && value > 0) {
                this.setData({
                    noOfPerson: value
                })
            }
        }
    },
    bindItemInput: function(evt) {
        var that = this
        if (evt && evt.detail && typeof evt.detail.value == 'string') {
            var value = evt.detail.value
            if (value) {
                var extraItems = that.data.extraItems
                if (evt.currentTarget && evt.currentTarget.dataset) {
                    var index = evt.currentTarget.dataset.index
                    var item = extraItems[index]
                    item.value = value
                    this.setData({
                        extraItems: extraItems
                    })
                }
            }
        }
    },
    bindConfirmEnroll: function(evt) {
        //initial
        var that = this
        that.setData({
            errorMessage: " "
        })
        //validate extra item
        var extra = $.getExtra(that.data.extraItems)
        for (var i = 0, len = extra.items.length; i < len; i++) {
            let item = extra.items[i]
            if (typeof item.value === 'undefined' || item.value === null || item.value.length === 0) {
                wx.showModal({
                    title: '提示',
                    content: '请提供“' + item.name + '”信息',
                    showCancel: false
                })
                return
            }
        }

        var project = that.data.project
        if (project && project._id) {
            var data = {
                noOfPerson: that.data.noOfPerson,
                extra: extra
            }
            that.showProgress()
            request
                .post(URL.enroll + project._id, data)
                .then(function(res) {
                    that.hideProgress()
                    wx.showToast({
                        title: '报名成功',
                        icon: 'success',
                        duration: 2000,
                        mask: true,
                        success: function() {
                            setTimeout(function() {
                                wx.navigateBack()
                            }, 2000)
                        }
                    })
                })
                .catch(function(err) {
                    that.hideProgress()
                    that.setData({
                        errorMessage: err
                    })
                })
        }
    },
    bindLeaveEnroll: function() {
        var that = this
        that.setData({
            errorMessage: " "
        })
        var project = that.data.project
        if (project && project._id) {
            that.showProgress()
            request
                .delete(URL.enroll + project._id)
                .then(function(res) {
                    that.hideProgress()
                    wx.showToast({
                        title: '取消这次报名',
                        icon: 'success',
                        duration: 2000,
                        mask: true,
                        success: function() {
                            setTimeout(function() {
                                wx.navigateBack()
                            }, 2000)
                        }
                    })
                })
                .catch(function(err) {
                    that.hideProgress()
                    that.setData({
                        errorMessage: err
                    })
                })
        }
    },
    /*
    bindShareInfo: function(evt) {
        wx.showShareMenu({})
    },*/
    bindManageTap: function(evt) {
        var that = this
        var isPublished = true;
        if (!that.data.available) {
            isPublished = false;
        }
        wx.showActionSheet({
            itemList: isPublished ? ['查看报名情况', '修改本次活动', '取消本次活动', '二维码'] : ['查看报名情况'],
            success: function(res) {
                if (res.tapIndex == 0) {
                    //查看报名情况
                    wx.navigateTo({
                        url: '../project_enroll/project_enroll?projectId=' + that.data.project._id
                    })
                /*} else if (res.tapIndex == 1) {
                    //复制活动
                    wx.redirectTo({
                        url: '../start_project/start_project?projectId=' + that.data.project._id + '&action=copy'
                    })*/
                } else if (res.tapIndex == 1) {
                    //修改本次活动
                    wx.redirectTo({
                        url: '../start_project/start_project?projectId=' + that.data.project._id + '&action=edit'
                    })
                } else if (res.tapIndex == 2) {
                    //取消本次活动
                    wx.showModal({
                        title: '取消本次活动',
                        content: '你确定要取消这次活动吗？',
                        success: function(res2) {
                            if (res2.confirm) {
                                request
                                    .delete(URL.myProjects + that.data.project._id)
                                    .then(function() {
                                        wx.showToast({
                                            title: '你取消本次活动了',
                                            icon: 'success',
                                            duration: 2000,
                                            mask: true,
                                            success: function() {
                                                setTimeout(function() {
                                                    wx.navigateBack()
                                                }, 2000)
                                            }
                                        })
                                    })
                                    .catch(function() {
                                        that.setData({
                                            errorMessage: '暂时无法取消活动，请稍后再试'
                                        })
                                    })
                            }
                        }
                    })
                } else if (res.tapIndex == 3) {
                    if (that.data.project && that.data.project.qrcode) {
                        var imgurl = URL.qrcode(that.data.project.qrcode)
                        wx.previewImage({
                            current: imgurl,
                            urls: [imgurl]
                        })

                    }
                }
            }
        })
    },
    bindCopyPasteTap: function() {
        var project = this.data.project
        var copyContent = []
        copyContent.push('【'+project.status+'】'+project.title)
        copyContent.push('时间：'+project.startDate+' 至 '+project.endDate)
        copyContent.push('地点：'+project.address)
        copyContent.push('人数：'+project.noOfPerson+'/'+project.limitOfPerson)
        copyContent.push(project.description)
        var names = []
        _.each(this.data.enrollments, function(enrollment){
            names.push(enrollment.userId.nickName)
        })
        if (names.length > 0) {
            copyContent.push('已报名有：'+names.join(', '))
        }


        wx.setClipboardData({
            data: copyContent.join('\n'),
            success: function(res) {
                wx.getClipboardData({
                    success: function(res) {
                        wx.showToast({
                            title: '活动内容复制到剪贴板里了。',
                            icon: 'success',
                            duration: 2000
                        })
                    }
                })
            }
        })
    },
})
