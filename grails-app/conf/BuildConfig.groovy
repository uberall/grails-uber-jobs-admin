grails.project.class.dir = "target/classes"
grails.project.test.class.dir = "target/test-classes"
grails.project.test.reports.dir = "target/test-reports"

grails.project.fork = [
    test: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, daemon:true],
    run: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
    war: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256, forkReserve:false],
    console: [maxMemory: 768, minMemory: 64, debug: false, maxPerm: 256]
]

grails.project.dependency.resolver = "maven" // or ivy
grails.project.dependency.resolution = {
    inherits("global") {}
    log "warn"
    repositories {
        grailsCentral()
        mavenLocal()
        mavenCentral()
        jcenter()
        mavenRepo "http://dl.bintray.com/errbuddy/plugins"
        
    }
    dependencies {
    }

    plugins {

        build(":release:3.0.1",":rest-client-builder:1.0.3") {
            export = false
        }

        compile(":asset-pipeline:2.1.5", ":less-asset-pipeline:2.1.0", ":react-asset-pipeline:1.1.2"){
            export = false
        }

        build(':tomcat:7.0.55') {
            export = false
        }

        compile ":twitter-bootstrap:3.3.4"
        compile ":font-awesome-resources:4.3.0.1"
        compile ":jquery:1.11.1"
    }
}
