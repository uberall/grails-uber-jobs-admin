'use strict';
//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../stores/worker-store.js
//= require ../stores/queue-store.js
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

    _initialValue: null,

    getInitialState: function() {
      return {
        worker: {},
        errors: {},
        errorCode: null,
        queues: {},
        sending: false,
        success: null
      };
    },

    componentWillMount: function() {
        if(this.props.worker === 'add') {
            // do nothing as we want to add a worker
        } else if(!isNaN(this.props.worker)){
            WorkerStore.get(this.props.worker, function (resp) {
                this._initialValue = _.clone(resp.worker, true);
                this.state.worker = resp.worker;
                this.setState(this.state);
                QueueStore.list('name', 'asc', 1000, 0, function (response) {
                    this.state.queues = response.list;
                    this.setState(this.state);
                }.bind(this))
            }.bind(this), function () {
                ReactMiniRouter.navigate("/workers/1");
            })
        } else {
            ReactMiniRouter.navigate("/workers/1");
        }
    },

    onSaveSuccess: function (response) {
        if(this.props.worker === 'add'){
            // just navigate to update page of the created worker
            ReactMiniRouter.navigate("/worker/"+respone.worker.id, true)
        } else {
            this.state.sending = false;
            this.state.success = true;
            this.state.worker = response.worker;
            this.state.errors = {}
            this.state.errorCode = {}
            this._initialValue = _.clone(response.worker, true);
            this.setState(this.state)
        }
        
    },

    onSaveError: function (response) {
        this.state.sending = false;
        this.state.success = false;
        if(response.status === 400){
            this.state.error = response.responseJSON.error;
        } else {
           this.state.errorCode = response.status
        }
        this.setState(this.state)
    },

    onFormSubmit: function (e) {
        e.preventDefault();
        this.state.sending = true;
        this.setState(this.state)
        if(this.state.worker.id) {
            WorkerStore.update(this.state.worker, this.onSaveSuccess, this.onSaveError);
        }
    },

    onFormReset: function (e) {
        this.state.worker = _.clone(this._initialValue, true);
        this.state.success = null;
        this.state.errors = {}
        this.state.errorCode = {}
        this.setState(this.state);
        e.preventDefault();
    },

    _onQueueSelectionChanged: function (e) {
        var ids = $(e.target).val();
        var newQueues = [];
        _.each(ids, function (idString) {
            var id = Number(idString);
            var queue = _.find(this.state.queues, function (queue) {
                return queue.id === id;
            })
            newQueues.push({id: id, name: queue.name})
        }.bind(this));
        this.state.worker.queues = newQueues;
        this.setState(this.state);
    },

    render: function() {
        var worker = this.state.worker;
        var cx = React.addons.classSet;
        var submitButtonClasses = cx({
            "btn": true,
            "btn-default": true,
            "disabled": this.state.sending
        });

        var resetButtonClasses = cx({
            "btn": true,
            "btn-warning": true,
            "disabled": this.state.sending
        });

        var selectedOptions = [];
        var notSelectedOptions = [];
        _.each(this.state.queues, function (queue) {
            var enabled = _.find(worker.queues, function(q) {
              return q.id === queue.id;
            }) !== undefined;
            /**
            if(enabled) {
                // we place selected options into an extra array to have them on the top of the select box, but we still want them to be ordered by name
                selectedOptions.push(<option value={queue.id} selected={enabled} key={"q"+queue.id}>{queue.name}</option>)    
            } else {
                notSelectedOptions.push(<option value={queue.id} selected={enabled} key={"q"+queue.id}>{queue.name}</option>)    
            }
            **/
            notSelectedOptions.push(<option value={queue.id} key={"q"+queue.id}>{queue.name}</option>)    
        });

        var selectedIds = [];
        _.each(worker.queues, function (queue) {
            selectedIds.push(queue.id)
        });

        var alertMessage = "";
        if(this.state.success) {
            alertMessage = "Successfully saved."
        } else if(this.state.success === false) {
            alertMessage = "Saving failed."
            if(this.state.errorCode){
                alertMessage += " (" + this.state.errorCode + ")";
            }
        }
        return (
            <div className="row">
                <div className="col-sm-12">
                    
                    <form className="form-horizontal" onSubmit={this.onFormSubmit} onReset={this.onFormReset}>
                    <div className="form-group">
                        <label className="col-sm-2 control-label">Pool</label>

                        <div className="col-sm-10">
                            <input type="text" className="form-control" value={worker.poolName} readOnly={true}/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Hostname</label>

                        <div className="col-sm-10">
                            <input type="text" className="form-control" value={worker.hostname} readOnly={true}/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Index</label>

                        <div className="col-sm-10">
                            <input type="text" className="form-control" value={worker.index} readOnly={true}/>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="col-sm-2 control-label">Index</label>

                        <div className="col-sm-10">
                            <select value={selectedIds} className="form-control" size="20" name="queues" onChange={this._onQueueSelectionChanged} multiple={true}>
                                {selectedOptions}
                                {notSelectedOptions}
                            </select>
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <button type="submit" className={submitButtonClasses}>Save</button>
                            <button type="reset" className={resetButtonClasses}>Reset</button>
                        </div>
                    </div>
                    <div className="col-sm-10 col-sm-offset-2">
                        <Alert visible={this.state.success !== null} type={this.state.success ? 'success' : 'danger'} text={alertMessage} />
                    </div>
                </form>
                </div>
            </div>
        );
    }
});
