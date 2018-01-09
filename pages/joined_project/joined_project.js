var ProjectsPage = require('../projectspage')
var URL = require('../../const/URL')

ProjectsPage({
    data: {
        url: URL.joinedProjects,
        emptyMessage: '你还没有参加过任何活动呢'
    },
    onLoad3: function(option){
        this.afterPageLoad()
    }

})
