class UrlMappings {

	static mappings = {
		"/uberjobs"(controller: 'uberjobsAdmin', action: 'index')
        "/uberjobs/**"(controller: 'uberjobsAdmin', action: 'index')
	}
}
