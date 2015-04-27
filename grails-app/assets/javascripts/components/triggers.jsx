(function () {
    "use strict";
}());

//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../lib/lodash.js
//= require ../stores/job-meta-store.js
//= require ../stores/trigger-store.js
//= require paginator.jsx
//= require commons.jsx

var TriggerList = React.createClass({
    _intervalid: 0,
    _sort: {field: "id", order: "desc"},
    _page: 1,
    _max: 20,

    getInitialState: function () {
        return {list: [], total: 0};
    },

    setPage: function (page) {
        ReactMiniRouter.navigate("/jobs/" + page, true);
        this._page = page;
        this.updateList();
    },

    componentDidMount: function () {
        this.updateList();
        this._intervalid = setInterval(this.updateList, 5000);
    },

    componentWillMount: function () {
        this._page = this.props.page || 1;
        this._max = Number(localStorage.getItem("uberjobs.settings.trigger.max")) || 20;
    },

    componentWillUnmount: function () {
        clearInterval(this._intervalid);
    },

    updateList: function (force) {
        if (this.isMounted() && (!window.paused || force == true)) {
            TriggerStore.list(this._sort.field, this._sort.order, this._max, (this._page - 1) * this._max, this.listUpdated);
        }
    },

    listUpdated: function (resp) {
        this.state.list = resp.list;
        this.setState({list: resp.list, total: resp.total});
    },

    sortChanged: function (field, order) {
        this._sort = {field: field, order: order};
        this.updateList();
    },

    maxChanged: function (value) {
        this._max = value
        localStorage.setItem("uberjobs.settings.trigger.max", value)
        this.updateList(true);
    },

    render: function () {
        var listItems = [];
        _.each(this.state.list, function (trigger) {
            listItems.push(<TriggerListItem trigger={trigger}/>)
        });
        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                        <MaxButtonGroup current={this._max} numbers={[20,50,100]} onChange={this.maxChanged} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="table table-hover table-condensed table-responsive">
                            <thead>
                                <SortableColumn text="name" field="name" onToggled={this.sortChanged} current={this._sort}/>
                                <SortableColumn text="Queue" field="queueName" onToggled={this.sortChanged} current={this._sort}/>
                                <SortableColumn text="Enabled" field="enabled" onToggled={this.sortChanged} current={this._sort}/>
                                <SortableColumn text="Next Fire (estimated)" field="estimatedNextExecution" onToggled={this.sortChanged} current={this._sort}/>
                                <SortableColumn text="Last Fired" field="lastFired" onToggled={this.sortChanged} current={this._sort}/>
                                <th>Cron Expression</th>
                                <th>Arguments</th>
                                <th></th>
                            </thead>
                            <tbody>
                                {listItems}
                            </tbody>
                        </table>
                        <Pager pages={Math.ceil(this.state.total / this._max)} current={this._page}
                               onChange={this.setPage}/>
                    </div>
                </div>
            </div>
        );
    }
});

var TriggerListItem = React.createClass({

    editButtonClicked: function () {
        ReactMiniRouter.navigate("/triggers/details/" + this.props.trigger.id)
    },

    render: function () {
        var trigger = this.props.trigger;
        return (
            <tr>
                <td>{trigger.name}</td>
                <td>{trigger.queueName}</td>
                <td>{trigger.enabled}</td>
                <td><FromNow time={trigger.estimatedNextExecution}/></td>
                <td><FromNow time={trigger.lastFired}/></td>
                <td>{trigger.cronExpression}</td>
                <td>{JSON.stringify(trigger.argument)}</td>
                <td><a href="javascript: void(0)" onClick={this.editButtonClicked} className="btn btn-sm btn-default"><i
                    className="fa fa-pencil"></i></a></td>
            </tr>
        )
    }
});


var TriggerDetails = React.createClass({

    _initialValue: null,

    getInitialState: function () {
        return {
            trigger: {},
            error: {},
            sending: false,
            success: null,
        };
    },

    componentDidMount: function () {
        TriggerStore.get(this.props.id, function (response) {
            this._initialValue = _.clone(response.trigger, true);
            this.setState({trigger: response.trigger});
        }.bind(this), function (resp) {
            console.log(resp)
            ReactMiniRouter.navigate("/triggers/1")
        }.bind(this));
    },

    onValueChanged: function (e) {
        this.state.success = null;
        var $el = $(e.target);
        switch ($el.prop("type")) {
            case 'checkbox':
                this.state.trigger[$el.prop('name')] = $el.is(':checked');
                break;
            default:
                this.state.trigger[$el.prop('name')] = $el.val();
                break;
        }
        this.setState(this.state)
    },

    onFormSubmit: function (e) {
        this.state.sending = true;
        this.setState(this.state);
        TriggerStore.update(this.state.trigger, function (resp) {
            this._initialValue = _.clone(resp.trigger, true);
            this.state.trigger = resp.trigger;
            this.state.sending = false;
            this.state.success = true;
            this.state.error = {};
            this.setState(this.state)
        }.bind(this), function (resp) {
            this.state.error = resp.responseJSON.error;
            this.state.sending = false;
            this.state.success = false;
            this.setState(this.state);
        }.bind(this))
        e.preventDefault();
    },

    onFormReset: function (e) {
        this.state.trigger = _.clone(this._initialValue, true);
        this.state.success = null;
        this.setState(this.state);
        e.preventDefault();
    },

    hidAlert: function (e) {
        this.state.success = null;
        this.setState(this.state);
        e.preventDefault();
    },

    render: function () {
        var content = "loading"
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

        var alertClasses = cx({
            "alert": true,
            "alert-dismissible": true,
            "alert-success": this.state.success === true,
            "hidden": this.state.success !== true
        });

        if (this.state.trigger.id !== undefined) {
            content = (
                <form className="form-horizontal" onSubmit={this.onFormSubmit} onReset={this.onFormReset}>
                    <div className={alertClasses} role="alert">
                        <button type="button" className="close" aria-label="Close" onClick={this.hideAlert}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <strong>Saved successfully.</strong>
                    </div>
                    <ValidateableInput field="name" onChange={this.onValueChanged} required="required"
                                       placeholder="Name" text="Name" error={this.state.error}
                                       value={this.state.trigger.name}/>
                    <ValidateableInput field="queueName" onChange={this.onValueChanged}
                                       placeholder="Queue (optional, jobs default queue will be used if not set)"
                                       text="Queue" error={this.state.error} value={this.state.trigger.queueName}/>
                    <ValidateableInput field="cronExpression" onChange={this.onValueChanged} required={true}
                                       placeholder="Cron Expression" text="Cron Expression" error={this.state.error}
                                       value={this.state.trigger.cronExpression}/>

                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" onChange={this.onValueChanged}
                                           checked={this.state.trigger.enabled}/> Enabled
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <button type="submit" className={submitButtonClasses}>Save</button>
                            <button type="reset" className={resetButtonClasses}>Reset</button>
                        </div>
                    </div>
                </form>
            )
        }
        ;

        return (
            <div className="row">
                <div className="col-sm-12">
                    {content}
                </div>
            </div>
        );
    }
});











