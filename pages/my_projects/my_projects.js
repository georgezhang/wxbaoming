var ProjectsPage = require('../projectspage')
var URL = require('../../const/URL')

ProjectsPage({
    data: {
        url: URL.myProjects,
        emptyMessage: '你还没有发布任何活动呢'
    },
    onLoad3: function(option){
        this.afterPageLoad()
    }

})
