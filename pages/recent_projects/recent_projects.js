var ProjectsPage = require('../projectspage')
var URL = require('../../const/URL')

ProjectsPage({
    data: {
        url: URL.recentProjects,
        emptyMessage: '这地区暂时没有新活动'
    },
    onLoad3: function(option){
        this.afterPageLoad()
    }

})
