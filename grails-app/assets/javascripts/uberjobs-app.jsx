'use strict';
//= require react-with-addons
//= require jsx
//= require constants.js
//= require lib/react-mini-router.js
//= require components/navbar.jsx
//= require components/jobs.jsx
//= require components/triggers.jsx
//= require components/queues.jsx
//= require components/workers.jsx
//= require components/overview.jsx

var App = React.createClass({

    mixins: [ReactMiniRouter.RouterMixin],

    routes: {
        '/': 'home',
        '/jobs/enqueue': 'jobEnqueue',
        '/jobs/:page': 'jobList',
        '/triggers/:page': 'triggerList',
        '/triggers/details/:id': 'triggerDetails',
        '/workers/:page': 'workerList',
        '/worker/:id': 'workerDetails',
        '/queues/:page': 'queueList'
    },

    render: function() {
        return (
          <div className="app">
            <Navbar />
            <div className="container">
              {this.renderCurrentRoute()}
            </div>
          </div>
          )
    },

    getPageAsNumber: function(page){
      return Number(page) || 1;
    },

    home: function() {
        window.action = Actions.OVERVIEW;
        return <Overview />;
    },

    jobList: function(page){
      window.action = Actions.JOBS_LIST;
      
      return <JobList page={this.getPageAsNumber(page)}/>;
    },

    triggerList: function(page){
      window.action = Actions.TRIGGER_LIST;
      
      return <TriggerList page={this.getPageAsNumber(page)}/>;
    },

    triggerDetails: function (id) {
      window.action = Actions.Trigger_DETAILS;
      return <TriggerDetails id={parseInt(id)}/>;
    },

    jobEnqueue: function(){
      window.action = Actions.JOBS_MANUAL;
      return <JobManualView />;
    },

    workerList: function(page){
      window.action = Actions.WORKER_LIST;
      return <WorkerList page={this.getPageAsNumber(page)}/>
    },

    workerDetails: function(id){
      window.action = Actions.WORKER_DETAILS;
    },

    queueList: function(page){
      window.action = Actions.QUEUES;
      return <QueueList page={this.getPageAsNumber(page)}/>
    },

    message: function(text) {
        return <div>{text}</div>;
    },

    notFound: function(path) {
        return <div class="not-found">Page Not Found: {path}</div>;
    }

});

React.render(
    <App history={false}/>,
    document.body
);
