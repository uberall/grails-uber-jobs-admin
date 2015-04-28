(function () {
    "use strict";
}());

//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../lib/lodash.js
//= require ../stores/job-store.js
//= require ../stores/job-meta-store.js
//= require ../stores/queue-store.js
//= require paginator.jsx
//= require commons.jsx

var JobList = React.createClass({

    _intervalid: 0,
    _sort: {field: "doAt", order: "desc"},
    _filterAvailable: ["OPEN", "WORKING", "SUCCESSFUL", "FAILED", "SKIPPED"],
    _filters: ["OPEN"],
    _page: 1,
    _max: 20,

    getInitialState: function () {
        return {list: [], total: 0};
    },

    setPage: function (page) {
        ReactMiniRouter.navigate("/jobs/" + page, true);
        this._page = page;
        this.updateList(true);
    },

    updateList: function (force) {
        if (this.isMounted() && (!window.paused || force == true)) {
            JobStore.list(this._sort.field, this._sort.order, this._max, (this._page - 1) * this._max, this._filters, this.listUpdated);
        }
    },

    listUpdated: function (resp) {
        if(this.isMounted()){
            this.state.list = resp.list;
            this.setState({list: resp.list, total: resp.total});
        }
    },

    componentDidMount: function () {
        this._page = this.props.page || 1;
        this._max = Number(localStorage.getItem("uberjobs.settings.jobs.max")) || 20;
        this.updateList(true);
        this._intervalid = setInterval(this.updateList, SettingsStore.getSetting(UserSettings.REFRESH_INTERVAL));
    },

    componentWillUnmount: function () {
        clearInterval(this._intervalid);
    },

    sortChanged: function (field, order) {
        this._sort = {field: field, order: order};
        this.updateList(true);
    },

    filterButtonClicked: function (e) {
        var $button = $(e.target);
        var filters = this._filters;
        var filter = $button.data("filter")
        if ($button.hasClass("btn-success")) {
            _.remove(filters, function (val) {
                return val === filter;
            });
        } else {
            filters.push(filter);
        }
        this._filters = filters;
        this.updateList(true);
    },

    allButtonClicked: function () {
        this._filters = this._filterAvailable.slice(0);
        this.updateList(true);
    },

    resetbuttonClicked: function () {
        this._filters = ['OPEN'];
        this.updateList(true);
    },

    maxChanged: function (value) {
        localStorage.setItem("uberjobs.settings.jobs.max", value);
        this._max = value;
        this.updateList(true);
    },

    render: function () {
        var listItems = [];
        for (var i = 0; i < this.state.list.length; i++) {
            var job = this.state.list[i];
            listItems.push(<JobListItem job={job} key={job.id}/>);
        }
        var cx = React.addons.classSet;
        var buttons = [];
        _.each(this._filterAvailable, function (filter) {
            var choosen = _.indexOf(this._filters, filter) > -1;
            var classes = cx({"btn": true,"btn-xs": true, "btn-default": choosen === false, "btn-success": choosen === true});
            buttons.push(<button onClick={this.filterButtonClicked} type="button" className={classes} key={filter} data-filter={filter}>{filter}</button>)
        }.bind(this));

        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="btn-toolbar">
                            <div className="btn-group" role="group" aria-label="StatusFilter">
                                {buttons}
                                <button onClick={this.allButtonClicked} type="button" className="btn btn-xs btn-default" key="ALL">all</button>
                                <button onClick={this.resetbuttonClicked} type="button" className="btn btn-xs btn-default" key="NONE">clear</button>
                            </div>
                            <MaxButtonGroup current={this._max} numbers={[20,50,100,1000]} onChange={this.maxChanged} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="table table-hover table-condensed table-responsive">
                            <thead>
                            <SortableColumn text="Execution Time" field="doAt" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Queue" field="queue" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Job" field="job" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Status" field="status" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Started" field="started" onToggled={this.sortChanged} current={this._sort}/>
                            <th>Took</th>
                            <th>Arguments</th>
                            <th></th>
                            </thead>
                            <tbody>
                            {listItems}
                            </tbody>
                        </table>
                        <Pager pages={Math.ceil(this.state.total / this._max)} current={this._page} onChange={this.setPage}/>
                    </div>
                </div>
            </div>
        );
    }
});

var JobListItem = React.createClass({

    getInitialState: function() {
      return {
        queue: {},
        jobMeta: {},
      };
    },

    componentWillReceiveProps: function(nextProps) {
        if(this.state.queue.id !== nextProps.job.queue){
            this._queueChanged(nextProps.job.queue)
        }
        if(this.state.jobMeta.id !== nextProps.job.job){
            this._jobMetaChanged(nextProps.job.job)
        }
    },

    componentDidMount: function() {
        this._queueChanged(this.props.job.queue)
        this._jobMetaChanged(this.props.job.job)  
    },

    _queueChanged: function (queueId) {
        QueueStore.get(queueId, function (queue) {
            this.state.queue = queue;
            this.setState(this.state);
        }.bind(this));
    },

    _jobMetaChanged: function (jobId) {
        JobMetaStore.get(jobId, function (job) {
            this.state.jobMeta = job;
            this.setState(this.state);
        }.bind(this));
    },

    _gotoDetails: function () {
        ReactMiniRouter.navigate("/job/" + this.props.job.id);
    },

    render: function () {
        var job = this.props.job;
        var started = ""
        if(job.started){
            started = <FromNow time={job.started} />
        }
        var jobName = job.job
        if(this.state.jobMeta.job){
            var realName = this.state.jobMeta.job;
            jobName = realName.substr(realName.lastIndexOf(".")+1)
        }
        return (<tr>
            <td><FromNow time={job.doAt}/></td>
            <td>{this.state.queue.name || job.queue}</td>
            <td>{jobName}</td>
            <td>{job.status}</td>
            <td>{started}</td>
            <td>{(job.status !== 'OPEN' ? moment(job.done).diff(moment(job.started)) : "")}</td>
            <td>{JSON.stringify(job.arguments)}</td>
            <td><button className="btn btn-default btn-xs" onClick={this._gotoDetails}>&nbsp;<i className="fa fa-arrow-right"></i></button></td>
        </tr>);
    }
});

var JobManualView = React.createClass({

    _jobs: [],
    _queues: [],

    getInitialState: function () {
        return {job: "", args: [{key: 1, value: ""}], queue: "", sending: false, success: null};
    },

    componentWillMount: function () {
        JobMetaStore.list("job", "asc", 1000, 0, function (resp) {
            this._jobs = [];
            for (var i = 0; i < resp.list.length; i++) {
                this._jobs.push(resp.list[i].job);
            }
            this.setState(this.state);
        }.bind(this));

    },

    enqueue: function (e) {
        e.preventDefault();
        this.state.sending = true;
        this.state.success = null;
        this.setState(this.state);
        var sendJob = {};
        sendJob.job = this.state.job;
        sendJob.args = [];
        _.each(this.state.args, function (argument) {
            if(value != null && value != ""){
                var value = argument.value
                if (!isNaN(value)) {
                    if (value.indexOf(".") > 0) {
                        value = parseFloat(value)
                    } else {
                        value = parseInt(value)
                    }
                } else if (value === "true") {
                    value = true
                } else if (value === "false") {
                    value = false
                }

                sendJob.args.push(value);    
            }
        });
        sendJob.queue = this.state.queue;
        JobStore.enqueue(sendJob, function () {
            this.state.sending = false;
            this.state.success = true;
            this.setState(this.state);
        }.bind(this));
    },

    addButtonClicked: function () {
        var args = this.state.args;
        var maxKey = _.max(args, function (chr) {
            return chr.key;
        });
        args.push({key: maxKey.key + 1, val: ""});
        this.setState({jobs: this.state.jobs, args: args, queue: this.state.queue, sending: this.state.sending, success: this.state.success});
    },

    argChanged: function (e) {
        var $self = $(e.target);
        var args = this.state.args;
        for (var i = 0; i < args.length; i++) {
            var arg = args[i];
            if (arg.key === $self.data("argkey")) {
                arg.value = $self.val();
            }
        }
        this.state.args = args;
        this.setState(this.state);
    },

    typeaheadValueChanged: function (value) {
        this.state.job = value;
        this.setState(this.state);
    },

    queueValueChanged: function (e) {
        this.state.queue = e.target.value;
        this.setState(this.state);
    },

    alertButtonClicked: function () {
        this.state.success = null;
        this.setState(this.state);
    },

    reset: function () {
        this.setState(this.getInitialState())
    },

    render: function () {
        var cx = React.addons.classSet;
        var buttonClass = cx({"disabled": this.state.sending === true, "btn": true, "btn-default": true})
        var alertClass = cx({"alert": true, "alert-success": true, "alert-dismissible": true, "hidden": this.state.success !== true})
        var argumentRows = [];
        for (var i = 0; i < this.state.args.length; i++) {
            var arg = this.state.args[i];
            argumentRows.push(<JobArgumentInput arg={arg} key={arg.key} changed={this.argChanged}/>);
        }
        return (
            <div className="row">
                <div className="col-sm-12">
                    <div className={alertClass} role="alert">
                        <button type="button" className="close" onClick={this.alertButtonClicked} aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        Job Enqueued
                    </div>
                    <form method="POST" className="form-horizontal" onSubmit={this.enqueue}>
                        <div className="form-group">
                            <label htmlFor="job" className="col-sm-2 control-label">Job</label>

                            <div className="col-sm-10">
                                <Typeahead array={this._jobs} name="job" id="job" value={this.state.job} valueChange={this.typeaheadValueChanged}/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="queue" className="col-sm-2 control-label">Queue</label>

                            <div className="col-sm-10">
                                <input type="text" name="queue" id="queue" value={this.state.queue} onChange={this.queueValueChanged} className="form-control"
                                       placeholder="optional, if not set: default queue for this job will be used"/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-2 control-label">Arguments
                                <button type="button" onClick={this.addButtonClicked} className="btn btn-default">add
                                </button>
                            </label>

                            <div className="col-sm-10">
                                <div className="field-group">
                                    {argumentRows}
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-offset-2 col-sm-10">
                                <button type="submit" className={buttonClass}>Enqueue</button>
                                <button type="reset" className="btn btn-default" onClick={this.reset}>Clear</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

var JobArgumentInput = React.createClass({
    render: function () {
        return (<input type="text" name="args" className="form-control" data-argkey={this.props.arg.key}
                       value={this.props.arg.value} onChange={this.props.changed}/>);
    }
});

var JobDetailsView = React.createClass({

    propTypes: {
        job: React.PropTypes.number.isRequired,
    },

    getInitialState: function() {
        return {
            job: {},
            failure: {},
            queue: {},
            jobMeta: {} 
        };
    },

    componentWillReceiveProps: function(nextProps) {
        JobStore.get(propsProps.job, function (response) {
            this._jobChanged(response.job)
        }.bind(this))
    },

    componentWillMount: function() {
        JobStore.get(this.props.job, function (response) {
            this._jobChanged(response.job)
        }.bind(this))
    },

    _jobChanged: function (job) {
        this.state.job = job;
        this.setState(this.state);
        JobStore.getFailure(job.id, function (response) {
            this.state.failure = response.failure,
            this.setState(this.state) 
        }.bind(this));
        QueueStore.get(job.queue, function (queue) {
            this.state.queue = queue;
            this.setState(this.state);
        }.bind(this));
        JobMetaStore.get(job.job, function (jobMeta) {
            this.state.jobMeta = jobMeta;
            this.setState(this.state);
        }.bind(this));
    },

    render: function() {
        var failureRows = []
        if(this.state.failure.id !== undefined) {
            var stacktrace = []
            _.each(JSON.parse(this.state.failure.stacktrace), function (stacktraceElement) {
                stacktrace.push("at " + stacktraceElement.className + "." + stacktraceElement.methodName + ":" + stacktraceElement.lineNumber)
            })
            failureRows.push(<dt key="flabel">Failure</dt>)
            failureRows.push(<dd key="fval">{this.state.failure.message}</dd>)
            failureRows.push(<dt key="flabel">Exception</dt>)
            failureRows.push(<dd key="fval">{this.state.failure.exception}</dd>)
            failureRows.push(<dt key="slabel">Stacktrace</dt>)
            failureRows.push(<dd key="sval"><pre>{JSON.stringify(stacktrace, 1, 1)}</pre></dd>)
        }
        return (
            <div className="row">
                <div className="col-sm-12">
                    <dl className="dl-horizontal">
                      <dt>Job</dt>
                      <dd>{this.state.jobMeta.job || this.props.job.job}</dd>
                      <dt>Queue</dt>
                      <dd>{this.state.queue.name || this.props.job.queue}</dd>
                      <dt>Status</dt>
                      <dd>{this.state.job.status}</dd>
                      <dt>Arguments</dt>
                      <dd>{JSON.stringify(this.state.job.arguments)}</dd>
                      <dt>Enqueued for</dt>
                      <dd><FormatDate time={this.state.job.doAt} /></dd>
                      <dt>Started</dt>
                      <dd><FormatDate time={this.state.job.started} /></dd>
                      <dt>Finished</dt>
                      <dd><FormatDate time={this.state.job.done} /></dd>
                      <dt>Took</dt>
                      <dd>{moment(this.state.job.done).diff(moment(this.state.job.started))}</dd>
                      {failureRows}
                    </dl>
                </div>
            </div>
        );
    }
});
