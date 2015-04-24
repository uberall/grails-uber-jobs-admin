package grails.plugin.uberjobs.admin

class UberJobsAdminController {

	def grailsApplication

	def beforeInterceptor = {
        if(! grailsApplication.config.grails.uberjobs.frontend.enabled){
            response.status = 404;
            return false
        }
        true
    }

    def index() {
    	[baseUrl: grailsApplication.config.grails.uberjobs.frontend.baseUrl]
    }
}
