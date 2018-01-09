var count = 0

var progress = {
    startProgress: function() {
        count++

        if (count == 0) {
            this.setData({
                progress_hide: false,
                progress_percent: 0
            })
        }
    },
    endProgress: function() {
        count--

        if (count == 0) {
            this.setData({
                progress_percent: 100
            })
            this.setData({
                progress_hide: true,
                progress_percent: 0
            })
        }
    }
}


module.exports = progress
