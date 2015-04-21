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

  getInitialState: function(){
    return {list: [], total: 0, max: 20, page: 1};
  },

  updateList: function(){
    if(this.isMounted()){
      WorkerStore.list(this._sort.field, this._sort.order, this.state.max, (this.state.page-1)*this.state.max, this._includeIdle, this._includeStopped, this.listUpdated)
    }
  },

  listUpdated: function(resp){
    this.setState({list: resp.list, total: resp.total, max: this.state.max, page: this.state.page});
  },

  componentDidMount: function(){
    this.updateList();
    this._intervalid = setInterval(this.updateList, 5000)
  },

  componentWillUnmount: function(){
    clearInterval(this._intervalid)
  },

  sortChanged: function(field, order){
    this._sort = {field: field, order: order};
    this.updateList();
  },

  idleCheckBoxChanged: function(e){
    this._includeIdle = $(e.target).prop('checked');
    this.updateList();
  },

  stoppedCheckBoxChanged: function(e){
    this._includeStopped = $(e.target).prop('checked');
    this.updateList();
  },

  render: function(){
    var workerList = []
    for(var i = 0; i < this.state.list.length; i++){
      var worker = this.state.list[i];
      workerList.push(<WorkerListItem worker={worker} key={worker.id}/>);
    }
    return (
      <div>
      <div className="row">
        <div className="col-sm-4 col-sm-offset-4">
          <label htmlFor="includeIdle">Show Idling <input id="includeIdle" type="checkbox" onChange={this.idleCheckBoxChanged}/></label>
        </div>
        <div className="col-sm-4">
          <label htmlFor="includeStopped">Show Stopped <input id="includeStopped" type="checkbox" onChange={this.stoppedCheckBoxChanged}/></label>
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
            </thead>
            <tbody>
                {workerList}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    )
  }
});

var WorkerListItem = React.createClass({
  render: function(){
    var worker = this.props.worker
    return (<tr>
      <td>{worker.status}</td>
      <td>{worker.hostname}</td>
      <td>{worker.poolName}</td>
      <td>{worker.index}</td>
    </tr>)
  }
});