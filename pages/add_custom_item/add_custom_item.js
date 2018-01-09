var BasePage = require('../basepage')
BasePage({
    data: {
        newItem: null,
        errorMessage: '',
    },
    onLoad2: function(option){},
    bindNewItemInput: function(e) {
        this.data.newItem = e.detail.value
    },
    setError: function(errorMessage) {
        this.setData({
            errorMessage: errorMessage
        })
    },
    bindConfirmNewItem: function() {
        //validation
        if (!this.data.newItem) {
            this.setError('请输入一个信息框名字')
            return
        }
        var tmpExtraItems = this.app().getGlobalData('tmpExtraItems')
        if ( typeof tmpExtraItems == 'object' && tmpExtraItems.indexOf(this.data.newItem) > -1 ) {
            this.setError('信息框名字重复了，请输入一个新的')
            return
        }

        this.app().setGlobalData('tmpNewItem', this.data.newItem)
        wx.navigateBack()
    }
})
