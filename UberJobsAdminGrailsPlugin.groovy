class UberJobsAdminGrailsPlugin {
    def version = "0.1"
    def grailsVersion = "2.4 > *"
    def dependsOn = ["asset-pipeline": "2.0 > *", "less-asset-pipeline": "2.0 > *", "react-asset-pipeline": "1.1.2 > *"]
    def pluginExcludes = [
        "grails-app/views/error.gsp"
    ]

    def title = "Uber Jobs Admin Plugin" // Headline display name of the plugin
    def author = "Philipp Eschenbach"
    def authorEmail = "philipp@uberall.com"
    def description = '''Frontend to maintain uber-jobs'''

    def license = "BSD"
    def organization = [name: "uberall GmbH", url: "https://uberall.com/"]
    def developers = [[name: "Florian Langenhahn", email: "florian.langenhahn@uberall.com"]]
    def issueManagement = [ system: "GitHub", url: "https://github.com/uberall/grails-uber-jobs-admin/issues" ]
    def scm = [ url: "https://github.com/uberall/grails-uber-jobs-admin" ]
    def documentation = "http://grails.org/plugin/uber-jobs-admin"

}
