var Promise = require('./es6-promise')
var wait200 = function(isDone, resolve){
    setTimeout(function() {
        if (isDone()) {
            resolve();
        } else {
            wait200(isDone, resolve)
        }

    }, 600);
}

module.exports = {
    app: function() {
        if (!this.app0) {
            this.app0 = getApp()
        }
        return this.app0
    },
    wait: function(isDone) {
        return new Promise(function(resolve, reject) {
            wait200(isDone, resolve)
        })
    }
}
