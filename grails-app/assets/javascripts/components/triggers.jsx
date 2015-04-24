(function(){
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

    componentWillMount: function(){
        this._page = this.props.page || 1;
        this._max = Number(localStorage.getItem("uberjobs.settings.max")) || 20
    },

    componentWillUnmount: function () {
        clearInterval(this._intervalid);
    },

    updateList: function () {
        if (this.isMounted()) {
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

	render: function(){
        var listItems = [];
        _.each(this.state.list, function(trigger){
            listItems.push(<TriggerListItem trigger={trigger} />)
        })
		return (
			<div>
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
                        <Pager pages={Math.ceil(this.state.total / this._max)} current={this._page} onChange={this.setPage} />
                    </div>
                </div>
            </div>
            );
	}
});

var TriggerListItem = React.createClass({
	render: function(){
		var trigger = this.props.trigger;
		return (
				<tr>
					<td>{trigger.name}</td>
					<td>{trigger.queueName}</td>
					<td>{trigger.enabled}</td>
					<td><FromNow time={trigger.estimatedNextExecution} /></td>
					<td><FromNow time={trigger.lastFired}/></td>
                    <td>{trigger.cronExpression}</td>
					<td>{JSON.stringify(trigger.argument)}</td>
                    <td><a href="javascript: void(0)" className="btn btn-sm btn-default"><i className="fa fa-pencil"></i></a></td>
				</tr>
			)
	}
});


var TriggerDetails = React.createClass({

    getInitialState: function () {
        return {
            trigger: {}  
        };
    },

    componentDidMount: function() {
        TriggerStore.get(this.props.id, function (response) {
            this.setState({trigger: response.trigger})
        }.bind(this), function (resp) {
            console.log(resp)
            //ERROR
        }.bind(this))
    },

    render: function(){
        if(this.state.trigger.id === undefined){
            return (<div className="row">
                <div className="col-sm-12">
                    Loading
                </div>
            </div>)
        }
    }
});











