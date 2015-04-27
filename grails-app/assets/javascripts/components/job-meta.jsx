(function () {
    "use strict";
}());

//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../lib/lodash.js
//= require ../stores/job-meta-store.js
//= require paginator.jsx
//= require commons.jsx


var JobMetaList = React.createClass({
	_intervalid: 0,
    _sort: {field: "id", order: "asc"},
    _page: 1,
    _max: 20,

    getInitialState: function () {
        return {list: [], total: 0};
    },

    setPage: function (page) {
        ReactMiniRouter.navigate("/types/" + page, true);
        this._page = page;
        this.updateList(true);
    },

    updateList: function (force) {
        if (this.isMounted() && (!window.paused || force == true)) {
            JobMetaStore.list(this._sort.field, this._sort.order, this._max, (this._page - 1) * this._max, this.listUpdated);
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
        this._max = Number(localStorage.getItem("uberjobs.settings.jobMeta.max")) || 20;
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

    maxChanged: function (value) {
        localStorage.setItem("uberjobs.settings.jobMeta.max", value);
        this._max = value;
        this.updateList(true);
    },

    render: function () {
        var listItems = [];
        for (var i = 0; i < this.state.list.length; i++) {
            var job = this.state.list[i];
            listItems.push(<JobMetaListItem job={job} key={job.id}/>);
        }
        var cx = React.addons.classSet;

        return (
            <div>
                <div className="row">
                    <div className="col-sm-12">
                        <MaxButtonGroup current={this._max} numbers={[20,50, 100]} onChange={this.maxChanged} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <table className="table table-hover table-condensed table-responsive">
                            <thead>
                            <SortableColumn text="Name" field="job" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Enabled" field="enabled" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Minimum Delay" field="minDelay" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Is Singleton" field="singletonJob" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Earliest Next Execution" field="earliestNextExecution" onToggled={this.sortChanged} current={this._sort}/>
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

var JobMetaListItem = React.createClass({

	_onEditButtonClicked: function () {
		ReactMiniRouter.navigate("/type/"+this.props.job.id);
	},

	render: function() {
		var job = this.props.job;
		var cx = React.addons.classSet;
		var enabledClasses = cx({
			"fa": true,
			"fa-check": job.enabled,
			"fa-times": !job.enabled
		});

		var singletonClasses = cx({
			"fa": true,
			"fa-check": job.singletonJob,
			"fa-times": !job.singletonJob
		});
		return (
			<tr>
				<td>{job.job}</td>
				<td><i className={enabledClasses}></i></td>
				<td>{job.minDelay || 0}</td>
				<td><i className={singletonClasses}></i></td>
				<td><FromNow time={job.earliestNextExecution} /></td>
				<td><a href="javascript: void(0)" onClick={this._onEditButtonClicked} className="btn btn-default"><i className="fa fa-pencil"></i></a></td>
			</tr>
		);
	}
});


var JobMetaDetails = React.createClass({

    _initialValue: null,

    getInitialState: function () {
        return {
            jobMeta: {},
            error: {},
            errorCode: null,
            sending: false,
            success: null,
        };
    },

    componentDidMount: function () {
        JobMetaStore.get(this.props.id, function (response) {
            this._initialValue = _.clone(response.jobMeta, true);
            this.setState({jobMeta: response.jobMeta});
        }.bind(this), function (resp) {
            console.log(resp)
            ReactMiniRouter.navigate("/types/1")
        }.bind(this));
    },

    onValueChanged: function (e) {
        this.state.success = null;
        var $el = $(e.target);
        switch ($el.prop("type")) {
            case 'checkbox':
                this.state.jobMeta[$el.prop('name')] = $el.is(':checked');
                break;
            default:
            	var value = $el.val();
            	if(!isNaN(value)){
            		value = Number(value);
            	}
                this.state.jobMeta[$el.prop('name')] = value;
                break;
        }
        this.setState(this.state)
    },

    onFormSubmit: function (e) {
        this.state.sending = true;
        this.setState(this.state);
        JobMetaStore.update(this.state.jobMeta, function (resp) {
            this._initialValue = _.clone(resp.jobMeta, true);
            this.state.jobMeta = resp.jobMeta;
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
        this.state.jobMeta = _.clone(this._initialValue, true);
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

        var alertMessage = "";
        if(this.state.success) {
            alertMessage = "Successfully saved."
        } else if(this.state.success === false) {
            alertMessage = "Saving failed."
            if(this.state.errorCode){
                alertMessage += " (" + this.state.errorCode + ")";
            }
        }

        if (this.state.jobMeta.id !== undefined) {
            content = (
                <form className="form-horizontal" onSubmit={this.onFormSubmit} onReset={this.onFormReset}>
                   <div className="form-group">
                        <label className="col-sm-2 control-label">Job</label>

                        <div className="col-sm-10">
                            <pre>{this.state.jobMeta.job}</pre>
                        </div>
                    </div>
                    <ValidateableInput type="number" field="minDelay" onChange={this.onValueChanged} required={true}
                                       placeholder="minimum delay between two executions in milliseconds" text="Minimum Delay" error={this.state.error}
                                       value={this.state.jobMeta.minDelay}/>

                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="enabled" onChange={this.onValueChanged} checked={this.state.jobMeta.enabled}/> Enabled
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10">
                            <div className="checkbox">
                                <label>
                                    <input type="checkbox" name="singletonJob" onChange={this.onValueChanged} checked={this.state.jobMeta.singletonJob}/> Singleton Job
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
                    <div className="col-sm-10 col-sm-offset-2">
                        <Alert visible={this.state.success !== null} type={this.state.success ? 'success' : 'danger'} text={alertMessage} />
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
