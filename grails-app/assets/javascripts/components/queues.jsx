'use strict';
//= require react-with-addons
//= require ../lib/react-mini-router.js
//= require ../stores/queue-store.js
//= require commons.jsx

var QueueList = React.createClass({

    _intervalid: 0,
    _sort: {field: 'name', order: 'asc'},
    _page: 1,
    _max: 20,

    setPage: function (page) {
        ReactMiniRouter.navigate("/queues/" + page, true);
        this._page = page;
        this.updateList(true);
    },

    getInitialState: function () {
        return {list: [], total: 0};
    },

    updateList: function (force) {
        if (this.isMounted() && (!window.paused || force == true)) {
            QueueStore.list(this._sort.field, this._sort.order, this._max, (this._page - 1) * this._max, this.listUpdated)
        }
    },

    listUpdated: function (resp) {
        if(this.isMounted()) {
            this.state.list = resp.list;
            this.state.total = resp.total;
            this.setState(this.state);    
        }
    },

    componentDidMount: function () {
        this._page = this.props.page || 1;
        this._max = Number(localStorage.getItem("uberjobs.settings.queues.max")) || 20;
        this.updateList(true);
        this._intervalid = setInterval(this.updateList, 5000)
    },

    componentWillUnmount: function () {
        clearInterval(this._intervalid)
    },

    sortChanged: function (field, order) {
        this._sort = {field: field, order: order};
        this.updateList(true);
    },

    maxChanged: function (value) {
        localStorage.setItem("uberjobs.settings.queues.max", value);
        this._max = value;
        this.updateList(true);
    },

    render: function () {
        var cx = React.addons.classSet;

        var queueList = [];
        for (var i = 0; i < this.state.list.length; i++) {
            var queue = this.state.list[i];
            queueList.push(<QueueListItem queue={queue} key={queue.id}/>);
        }

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
                            <SortableColumn text=" " field="enabled" onToggled={this.sortChanged} current={this._sort}/>
                            <SortableColumn text="Name" field="name" onToggled={this.sortChanged} current={this._sort}/>
                            <th>Size</th>
                            </thead>
                            <tbody>
                            {queueList}
                            </tbody>
                        </table>
                        <Pager pages={Math.ceil(this.state.total / this._max)} current={this._page}
                               onChange={this.setPage}/>
                    </div>
                </div>
            </div>
        )
    }
});

var QueueListItem = React.createClass({
    render: function () {
        var queue = this.props.queue
        return (<tr>
            <td>{queue.enabled}</td>
            <td>{queue.name}</td>
            <td>{queue.items}</td>
        </tr>)
    }
});