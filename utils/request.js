var Promise = require('./es6-promise')
var URL = require('../const/URL')
var base = require('./base')
var _ = require('./lodash')
var cache = require('./cache')
var isLoginRunning = false
var lastRetryDate

var request = _.extend({
    login: function() {
        var that = this
        return this
            .getNetworkType()
            .then(function() {
                if (isLoginRunning) {
                    return that.wait(function() {
                        return !isLoginRunning
                    })
                } else {
                    isLoginRunning = true
                    //过程：登录微信 -> 取得code -> 获取用户信息 -> 传回后台 -> 得到新access_token -> 保留缓存
                    //登录微信
                    return new Promise(function(resolve, reject) {
                            wx.login({
                                success: function(res) {
                                    if (res.code) {
                                        resolve(res.code)
                                    } else {
                                        reject(res.errMsg)
                                    }
                                },
                                fail: function(err) {
                                    reject(err)
                                }
                            })
                        })

                        //获取用户信息
                        .then(function(code) {
                            //var p_userInfo =
                            return new Promise(function(resolve, reject) {
                                wx.getUserInfo({
                                    success: function(res) {
                                        that.app().setGlobalData('userInfo', res.userInfo) //保存用户信息到globalData
                                        resolve({
                                            code: code,
                                            wxres: res
                                        })
                                    },
                                    fail: function(err) {
                                        reject(err)
                                    }
                                })
                            })
                            //return p_userInfo
                        })
                        //传回后台
                        .then(function(data) {
                            return that.post(URL.token, {
                                code: data.code,
                                wxres: {
                                    encryptedData: data.wxres.encryptedData,
                                    iv: data.wxres.iv
                                }
                            })
                        })
                        //得到新access_token
                        .then(function(res) {
                            if (res.access_token && res.expires) {
                                that.app().setGlobalData('access_token', res.access_token)
                                that.app().setGlobalData('expires', res.expires)

                                //保存缓存
                                var p_access_token = cache.set('access_token', res.access_token)
                                var p_expires = cache.set('expires', res.expires)
                                var p_userInfo = cache.set('userInfo', that.app().getGlobalData('userInfo'))

                                return Promise.all([p_access_token, p_expires, p_userInfo])
                            }
                            //TODO: if no access_token, what should I do?
                        })
                        .then(function() {
                            isLoginRunning = false
                        })

                }
            })
    },
    get: function(url) {
        return this.connect('get', url)
    },
    post: function(url, data) {
        return this.connect('post', url, data)
    },
    delete: function(url) {
        return this.connect('delete', url)
    },
    setupToken: function(opt) {
        var access_token = this.app().getGlobalData('access_token')
        var expires = this.app().getGlobalData('expires')
        if (access_token && expires) {
            //TODO: check if access_token expires or not
            _.extend(opt.header, {
                'Authorization': 'JWT ' + access_token
            })

        }
    },
    connect: function(method, url, data) {
        var that = this
        return this
            .getNetworkType()
            .then(function() {
                var opt = {}
                opt.url = url
                opt.header = {
                    'content-type': 'application/json',
                    'v': URL.version,
                    'a': URL.app_alias
                }
                that.setupToken(opt)
                opt.method = method.toLowerCase()
                if (opt.method == 'post' && data) {
                    opt.data = data
                }
                return new Promise(function(resolve, reject) {
                    var exec = (function(opt0) {

                        function run() {
                            that.setupToken(opt0)
                            wx.request(_.extend(opt0, {
                                success: function(res) {
                                    if (res.statusCode == 200) {
                                        resolve(res.data)
                                    } else {
                                        //first retried or last retry 30 seconds ago
                                        if (res.statusCode == 401 &&
                                            (!lastRetryDate || (new Date(lastRetryDate.getTime() + 30000)) <= (new Date()))) {

                                            lastRetryDate = new Date()

                                            that
                                                .login()
                                                .then(function() {
                                                    run()
                                                })

                                        } else {
                                            reject(res.data && res.data.error ? res.data.error : res.errMsg)
                                        }
                                    }
                                },
                                fail: function(err) {
                                    reject(err)
                                }
                            }))
                        }

                        return run
                    }(opt))

                    exec()
                })

                //TODO: if no access_token or expires, perform login()
            })
    },
    getNetworkType: function() {
        return new Promise(function(resolve, reject) {
            wx.getNetworkType({
                success: function(res) {
                    // 返回网络类型, 有效值：
                    // wifi/2g/3g/4g/unknown(Android下不常见的网络类型)/none(无网络)
                    var networkType = res.networkType
                    if (networkType == 'none') {
                        wx.showToast({
                            title: '无法连接网络',
                            icon: 'loading',
                            duration: 2000
                        })
                        reject('无法连接网络，请开通网络后再试')
                    } else {
                        resolve(networkType)
                    }
                },
                fail: function() {
                    reject('无法连接网络，请开通网络后再试')
                }
            })
        })
    }
}, base)

module.exports = request
