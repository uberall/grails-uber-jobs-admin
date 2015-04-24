'use strict';
//= require react-with-addons
//= require lib/react-mini-router.js
//= require constants.js

var NavbarItem = React.createClass({

  onclick: function(){
      ReactMiniRouter.navigate(this.props.target);
  },

  render: function (){
    var cx = React.addons.classSet;
    var classes = cx({'active': window.action === this.props.action});
    return (<li className={classes}><a href="javascript: void(0)" onClick={this.onclick}>{this.props.text}</a></li>)
  }
});

var Navbar = React.createClass({
  render: function(){
    var cx = React.addons.classSet;
    var jobClasses = cx({'dropdown': true, 'active': window.action === Actions.JOBS_LIST || window.action === Actions.JOBS_MANUAL});
    var triggerClasses = cx({'dropdown': true, 'active': window.action === Actions.TRIGGER_LIST || window.action === Actions.TRIGGER_DETAILS});
    return (
      <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
        </div>
        <div id="navbar" className="collapse navbar-collapse">
          <ul className="nav navbar-nav">
            <NavbarItem text="Overview" action={Actions.OVERVIEW} target="/" />
            <li className={jobClasses}>
              <a href="javascript: void(0)" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Jobs <span className="caret"></span></a>
              <ul className="dropdown-menu" role="menu">
                <NavbarItem text="List" action={Actions.JOBS_LIST} target="/jobs/1" />
                <NavbarItem text="Enqueue" action={Actions.JOBS_MANUAL} target="/jobs/enqueue" />
              </ul>
            </li>
             <li className={triggerClasses}>
              <a href="javascript: void(0)" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Triggers <span className="caret"></span></a>
              <ul className="dropdown-menu" role="menu">
                <NavbarItem text="List" action={Actions.TRIGGER_LIST} target="/triggers/1" />
                <NavbarItem text="Add" action={Actions.TRIGGER_DETAILS} target="/triggers/add" />
              </ul>
            </li>
            <NavbarItem text="Worker" action={Actions.WORKERS} target="/workers" />
            <NavbarItem text="Queues" action={Actions.QUEUES} target="/queues" />
          </ul>
        </div>
      </div>
    </nav>
    )
  }
});
