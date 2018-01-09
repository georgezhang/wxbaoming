var Promise = require('./utils/es6-promise')
var cache = require('./utils/cache')
var request = require('./utils/request')

//app.js
App({
    //global function and data
    globalData: {
        userInfo: null,
        access_token: null,
        expires: null,
        //pass values between page start_project and add_custom_item
        tmpExtraItems: null,
        tmpNewItem: null
    },
    getGlobalData: function(key) {
        return this.globalData[key]
    },
    setGlobalData: function(key, value) {
        this.globalData[key] = value
    },
    onLaunch: function() {
    },
    //pull from cache
    getFromCache: function(){
        var that = this
        //调用API从本地缓存中获取数据
        //把用户信息从缓存里获取和access_token
        var p_userinfo = cache.get('userInfo')
        var p_token = cache.get('access_token')
        var p_expires = cache.get('expires')
        return Promise.all([p_userinfo, p_token, p_expires])
            .then(function() {
                //如果用户信息过期，重新登录获取
                if ((new Date(that.globalData.expires)) < (new Date())) {
                    throw new TypeError('local access_token expired')
                }
            }).catch(function(){
                return request.login()
            })
    },
    getUserInfo: function() {
        if (this.globalData.userInfo) {
            return Promise.resolve(this.globalData.userInfo)
        } else {
            return this.getFromCache()
        }
    }
})
