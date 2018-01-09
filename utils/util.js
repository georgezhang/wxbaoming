var dateFormat = require('./dateformat')
var _ = require('./lodash')

function formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()


    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}


function df(d) {
    return dateFormat(d, 'yyyy-mm-dd')
}

function dtf(d) {
    return dateFormat(d, 'yyyy-mm-dd HH:MM')
}

function getStatus(project, now) {
    return project.status == 1 ? (((new Date(project.dueDate)) > now) ? '报名中' : '已结束') : '已取消'
}

function getAvailable(project, now) {
    return project.status == 1 ? ((new Date(project.dueDate)) >= now) : false
}

function getLimitOfPerson(limitOfPerson) {
    return (limitOfPerson == 0) ? '不限' : limitOfPerson
}

function ef(extra) {
    var items = []
    if (extra && extra.items && extra.items.length > 0) {
        _.each(extra.items, function(item) {
            items.push({
                name: item
            })
        })
    }
    return items
}

function getExtra(items) {
    var extra = {}
    extra.items = []
    _.each(items, function(item) {
        if (typeof item.value != undefined) {
            extra.items.push(item)
        }
    })
    return extra
}

function mergeItems(items, extra) {
    if (extra && extra.items && extra.items.length > 0) {
        _.each(items, function(item) {

            var found = _.find(extra.items, function(im) {
                return im.name == item.name
            })
            if (found) {
                item.value = found.value
            }

        })
    }
    return items
}

function reloadItems(extraItems, items){
    if (items && items.length > 0) {
        _.each(items, function(item){
            var eItem = _.find(extraItems, function(o){ return o.name == item })
            if (eItem) {
                eItem.selected = true
                eItem.type = 'primary'
            } else {
                extraItems.push({
                    name: item,
                    type: 'primary',
                    selected: true
                })
            }
        })
    }
    return extraItems
}

function s(s) {
    return s.replace(/-/g, '/')
}

module.exports = {
    formatTime: formatTime,
    formatNumber: formatNumber,
    df: df,
    dtf: dtf,
    getStatus: getStatus,
    getAvailable: getAvailable,
    getLimitOfPerson: getLimitOfPerson,
    ef: ef,
    getExtra: getExtra,
    mergeItems: mergeItems,
    reloadItems: reloadItems,
    s: s,
}
