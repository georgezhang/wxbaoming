var Promise = require('./es6-promise')
var _ = require('./lodash')
var base = require('./base')

var cache = _.extend({
    get: function(key) {
        var that = this
        return new Promise(function(resolve, reject) {
                wx.getStorage({
                    key: key,
                    success: function(res) {
                        resolve({
                            key: key,
                            value: res.data
                        })
                    },
                    fail: function(err) {
                        reject(err)
                    }
                })
            })

            .then(function(kv) {
                that.app().setGlobalData(kv.key, kv.value)
            })
    },
    set: function(key, value) {
        return new Promise(function(resolve, reject) {
            wx.setStorage({
                key: key,
                data: value,
                success: function() {
                    resolve()
                },
                fail: function(err) {
                    reject(err)
                }
            })
        })
    }
}, base)

module.exports = cache
