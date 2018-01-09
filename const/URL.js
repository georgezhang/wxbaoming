var baseUrl = 'https://happy.iduckling.com/' //production
var version = '1'
var app_alias = '001'

var URL = {
    version: version,
    app_alias: app_alias,
    token: baseUrl + 'token',
    createProject: baseUrl + 'project/create/',
    myProjects: baseUrl + 'project/',
    recentProjects: baseUrl + 'project/recent/',
    projectEnroll: baseUrl + 'project/enroll/',
    joinedProjects: baseUrl + 'enroll/joined/',
    enroll: baseUrl + 'enroll/',
    qrcode: function(qrcode){
        return 'http://qr.iduckling.com/happyenroll/qr/'+qrcode+'.jpg'
    },
}
module.exports = URL
