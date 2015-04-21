'use strict';
//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../stores/queue-store.js
//= require commons.jsx

var QueueList = React.createClass({

  _intervalid: 0,
  _sort: {field: 'name', order: 'asc'},
  _includeEmpty: true,

  getInitialState: function(){
    return {list: [], total: 0, max: 20, page: 1};
  },

  updateList: function(){
    if(this.isMounted()){
      QueueStore.list(this._sort.field, this._sort.order, this.state.max, (this.state.page-1)*this.state.max, this._includeEmpty, this.listUpdated)
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

  emptyCheckboxChanged: function(e){
      this._includeEmpty = $(e.target).prop('checked');
    this.updateList();
  },

  render: function(){
    var queueList = []
    for(var i = 0; i < this.state.list.length; i++){
      var queue = this.state.list[i];
      queueList.push(<QueueListItem queue={queue} key={queue.id}/>);
    }
    return (
      <div>
        <div className="row">
          <div className="col-sm-4 col-sm-offset-8">
            <label htmlFor="includeEmpty">Show Empty <input id="includeEmpty" checked={this._includeEmpty} type="checkbox" onChange={this.emptyCheckboxChanged}/></label>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <table className="table table-hover table-condensed table-responsive">
            <thead>
              <SortableColumn text=" " field="enabled" onToggled={this.sortChanged} current={this._sort}/>
              <SortableColumn text="Name" field="name" onToggled={this.sortChanged} current={this._sort}/>
              <th>Size</th>
            </thead>
            <tbody>
                {queueList}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    )
  }
});

var QueueListItem = React.createClass({
  render: function(){
    var queue = this.props.queue
    return (<tr>
      <td>{queue.enabled}</td>
      <td>{queue.name}</td>
      <td>{queue.items}</td>
    </tr>)
  }
});