'use strict';
//= require react-with-addons
//= require lib/react-mini-router.js
//= require constants.js

var NavbarItem = React.createClass({

    onclick: function () {
        ReactMiniRouter.navigate(this.props.target);
    },

    render: function () {
        var cx = React.addons.classSet;
        var classes = cx({'active': window.action === this.props.action});
        var text = this.props.text;
        if(this.props.icon){
            text = (<i className={"fa fa-"+this.props.icon}></i>);
        }
        return (<li className={classes}><a href="javascript: void(0)" onClick={this.onclick}>{text}</a></li>);
    }
});

var PauseNavbarItem = React.createClass({

    getInitialState: function () {
        if (window.paused === undefined) {
            window.paused = false;
        }
        ;
        return {
            paused: window.paused,
        };
    },

    onButtonClick: function () {
        window.paused = !window.paused;
        this.state.paused = window.paused
        this.setState(this.state)
    },

    render: function (argument) {
        var cx = React.addons.classSet;
        var iconClass = cx({
            "fa": true,
            "fa-play": this.state.paused === true,
            "fa-pause": this.state.paused === false,
        });
        return (<li><a href="javascript: void(0)" onClick={this.onButtonClick}>&nbsp;<i className={iconClass}></i></a></li>);
    }
});

var Navbar = React.createClass({
    render: function () {
        var cx = React.addons.classSet;
        var jobClasses = cx({'dropdown': true, 'active': window.action === Actions.JOBS_LIST || window.action === Actions.JOBS_MANUAL || window.action === Actions.JOBS_DETAILS});
        var triggerClasses = cx({'dropdown': true, 'active': window.action === Actions.TRIGGER_LIST || window.action === Actions.TRIGGER_DETAILS});
        var workerClasses = cx({'dropdown': true, 'active': window.action === Actions.WORKER_LIST || window.action === Actions.WORKER_DETAILS});
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
                            <NavbarItem text="Overview" action={Actions.OVERVIEW} target="/"/>
                            <li className={jobClasses}>
                                <a href="javascript: void(0)" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Jobs <span
                                    className="caret"></span></a>
                                <ul className="dropdown-menu" role="menu">
                                    <NavbarItem text="List" action={Actions.JOBS_LIST} target="/jobs/1"/>
                                    <NavbarItem text="Enqueue" action={Actions.JOBS_MANUAL} target="/jobs/enqueue"/>
                                </ul>
                            </li>
                            <li className={triggerClasses}>
                                <a href="javascript: void(0)" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Triggers <span
                                    className="caret"></span></a>
                                <ul className="dropdown-menu" role="menu">
                                    <NavbarItem text="List" action={Actions.TRIGGER_LIST} target="/triggers/1"/>
                                    {/*<NavbarItem text="Add" action={Actions.TRIGGER_DETAILS} target="/triggers/add"/>*/}
                                </ul>
                            </li>
                            <li className={workerClasses}>
                                <a href="javascript: void(0)" className="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Workers <span
                                    className="caret"></span></a>
                                <ul className="dropdown-menu" role="menu">
                                    <NavbarItem text="List" action={Actions.WORKER_LIST} target="/workers/1"/>
                                    <NavbarItem text="Add" action={Actions.WORKER_MANUAL} target="/worker/add"/>
                                </ul>
                            </li>
                            <NavbarItem text="Queues" action={Actions.QUEUES} target="/queues/1"/>
                            <NavbarItem text="Job Types" action={Actions.JOB_META_LIST} target="/types/1"/>
                        </ul>
                        <ul className="nav navbar-nav navbar-right">
                            <PauseNavbarItem />
                            <NavbarItem text="" icon="cog" action={Actions.SETTINGS} target="/settings"/>
                        </ul>
                    </div>
                </div>
            </nav>
        )
    }
});