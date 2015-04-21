'use strict';
//= require queue-list.jsx
//= require worker-list.jsx

var Overview = React.createClass({
	render: function(){
		return (
			<div className="row">
				<div className="col-sm-6">
					<QueueList />
				</div>
				<div className="col-sm-6">
					<WorkerList />
				</div>
			</div>
		)
	}
})