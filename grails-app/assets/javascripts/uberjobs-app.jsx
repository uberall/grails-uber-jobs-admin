'use strict';
//= require react-with-addons
//= require jsx
//= require constants.js
//= require lib/react-mini-router.js
//= require components/navbar.jsx
//= require components/jobs.jsx
//= require components/queue-list.jsx
//= require components/worker-list.jsx
//= require components/overview.jsx

var App = React.createClass({

    mixins: [ReactMiniRouter.RouterMixin],

    routes: {
        '/': 'home',
        '/jobs/enqueue': 'jobEnqueue',
        '/jobs/:page': 'jobList',
        '/workers': 'workerList',
        '/queues': 'queueList'
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

    home: function() {
        window.action = Actions.OVERVIEW;
        return <Overview />;
    },

    jobList: function(page){
      window.action = Actions.JOBS_LIST;
      if(isNaN(page)){
        page = 1;
      } else {
        page = parseInt(page);
      }
      return <JobList page={page}/>;
    },

    jobEnqueue: function(){
      window.action = Actions.JOBS_MANUAL;
      return <JobManualView />;
    },

    workerList: function(){
      window.action = Actions.WORKERS;
      return <WorkerList />
    },

    queueList: function(){
      window.action = Actions.QUEUES;
      return <QueueList />
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
