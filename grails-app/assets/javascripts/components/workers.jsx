'use strict';
//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../stores/worker-store.js
//= require commons.jsx

var WorkerList = React.createClass({

    _intervalid: 0,
    _sort: {field: 'status', order: 'desc'},
    _includeIdle: false,
    _includeStopped: false,
    _page: 1,
    _max: 20,

    setPage: function (page) {
        ReactMiniRouter.navigate("/workers/" + page, true);
        this._page = page;
        this.updateList(true);
    },

    getInitialState: function () {
        return {list: [], total: 0};
    },

    updateList: function () {
        if (this.isMounted() && (!window.paused || force == true)) {
            WorkerStore.list(this._sort.field, this._sort.order, this._max, (this._page - 1) * this._max, this._includeIdle, this._includeStopped, this.listUpdated)
        }
    },

    listUpdated: function (resp) {
        if(this.isMounted()){
            this.setState({list: resp.list, total: resp.total, max: this.state.max, page: this.state.page});
        }
    },

    componentDidMount: function () {
        this._page = this.props.page || 1;
        this._max = Number(localStorage.getItem("uberjobs.settings.worker.max")) || 20;
        this.updateList(true);
        this._intervalid = setInterval(this.updateList, 5000)
    },

    componentWillMount: function () {
        this._includeIdle = localStorage.getItem("uberjobs.settings.showIdlingWorkers") === 'true'
        this._includeStopped = localStorage.getItem("uberjobs.settings.showStoppedWorkers") === 'true'
    },

    componentWillUnmount: function () {
        clearInterval(this._intervalid)
    },

    sortChanged: function (field, order) {
        this._sort = {field: field, order: order};
        this.updateList(true);
    },

    idleButtonClicked: function () {
        this._includeIdle = !this._includeIdle;
        localStorage.setItem("uberjobs.settings.showIdlingWorkers", this._includeIdle);
        this.updateList(true);
    },

    stoppedButtonClicked: function () {
        this._includeStopped = !this._includeStopped;
        localStorage.setItem("uberjobs.settings.showStoppedWorkers", this._includeStopped);
        this.updateList(true);
    },

    maxChanged: function (value) {
        localStorage.setItem("uberjobs.settings.max", value);
        this._max = value;
        this.updateList(true);
    },

    render: function () {
        var cx = React.addons.classSet;
        var workerList = []
        for (var i = 0; i < this.state.list.length; i++) {
            var worker = this.state.list[i];
            workerList.push(<WorkerListItem worker={worker} key={worker.id}/>);
        }
        
        var idlingButtonClasses = cx({
            "btn": true,
            "btn-default": !this._includeIdle,
            "btn-success": this._includeIdle,
        });

        var stoppedButtonClasses = cx({
            "btn": true,
            "btn-default": !this._includeStopped,
            "btn-success": this._includeStopped,
        });
        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                        <div className="btn-toolbar">
                            <div className="btn-group" role="group" aria-label="StatusFilter">
                                <button onClick={this.idleButtonClicked} type="button" className={idlingButtonClasses} key="IDLING">Show Idling</button>
                                <button onClick={this.stoppedButtonClicked} type="button" className={stoppedButtonClasses} key="STOPEED">Show Stopped</button>
                            </div>
                            <MaxButtonGroup current={this._max} numbers={[20,50,100]} onChange={this.maxChanged} />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="table table-hover table-condensed table-responsive">
                            <thead>
                            <SortableColumn text="Status" field="status" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Host" field="hostname" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Pool" field="poolName" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="index" field="index" onToggled={this.sortChanged} current={this._sort}/>
                            <th>Queues</th>
                            <th></th>
                            </thead>
                            <tbody>
                            {workerList}
                            </tbody>
                        </table>
                        <Pager pages={Math.ceil(this.state.total / this._max)} current={this._page} onChange={this.setPage}/>
                    </div>
                </div>
            </div>
        )
    }
});

var WorkerListItem = React.createClass({
    getInitialState: function() {
        return {
            showQueues: false 
        };
    },

    onQueueButtonPressed: function () {
      this.state.showQueues = !this.state.showQueues;
      this.setState(this.state);  
    },

    onEditButtonClicked: function () {
        ReactMiniRouter.navigate("/worker/" + this.props.worker.id)
    },

    render: function () {
        var cx = React.addons.classSet;
        var worker = this.props.worker
        var queueNameClasses = cx({
            "hidden" : !this.state.showQueues 
        });
        var queueNames = []
        _.each(worker.queues, function (queue) {
            queueNames.push(queue.name);
        })
        return (<tr>
            <td>{worker.status}</td>
            <td>{worker.hostname}</td>
            <td>{worker.poolName}</td>
            <td>{worker.index}</td>
            <td>
                <button type="button" className="btn btn-default" onClick={this.onQueueButtonPressed}>{worker.queues.length}</button>
                <pre className={queueNameClasses}>{queueNames.join(", ")}</pre>
            </td>
            <td><a href="javascript: void(0)" onClick={this.onEditButtonClicked} className="btn btn-default"><i
                    className="fa fa-pencil"></i></a></td>
        </tr>)
    }
});

var WorkerDetails = React.createClass({

    _initialWorker: null,

    getInitialState: function() {
      return {
        worker: {},
        errors: {},
        sending: false,
        success: null
      };
    },

    componentWillMount: function() {
        if(this.props.id === 'add') {
            // do nothing as we want to add a worker
        } else if(!isNaN(this.props.id)){
            WorkerStore.get(this.props.id, function (resp) {
                this._initialWorker = _.clone(response.worker, true);
                this.state.worker = resp.worker;
                this.setState(this.state);
            }.bind(this), function () {
                ReactMiniRouter.navigate("/workers/1");
            })
        } else {
            ReactMiniRouter.navigate("/workers/1");
        }
    },

    onSaveSuccess: function (response) {
        if(this.props.id === 'add'){
            // just navigate to update page of the created worker
            ReactMiniRouter.navigate("/worker/"+respone.worker.id, true)
        } else {
            this.state.sending = false;
            this.state.success = true;
            this.state.worker = response.worker;
            this._initialWorker = _.clone(response.worker, true);
            this.setState(this.state)
        }
        
    },

    onSaveError: function (response) {
        this.state.sending = false;
        this.state.success = false;
        this.state.error = resp.responseJSON.error;
        this.setState(this.state)
    }

    onFormSubmit: function (e) {
        this.state.sending = true;
        this.setState(this.state)
        if(this.state.worker.id) {
            WorkerStore.update(worker, this.onSaveSuccess, this.onSaveError)
        }
        e.preventDefault();
    }

    render: function() {
        return (
            <div />
        );
    }
});
