'use strict';

var WorkerStore = {
	_workers: {},

	_total: {},

	basePath: "workers",

	list: function(sort, order, max, offset, includeIdle, includeStopped, success){
		$.ajax({
			url: window.baseUrl + "/" + this.basePath,
			data: {sort: sort, order: order, max: max, offset:offset, includeIdle: includeIdle, includeStopped: includeStopped},
			success: function(resp){
				var list   = resp.list;
				this._total = resp.total;

				for(var i = 0; i<list.length; i++){
					this._addToWorkers(list[i]);
				}

				success(resp)

			}.bind(this)
		})
	},

	get: function(id, callback){
		if(this._workers[id] === undefined) {
			$.ajax({
				url: window.baseUrl + "/" + this.basePath +"/"+ id,
				success: function(resp){
					this._addToWorkers(resp.worker)
					callback(resp.worker)
				}.bind(this)
			})
		} else {
			callback(this._workers[id])
		}
	},

	_addToWorkers: function(worker){
		this._workers[worker.id] = worker;
	}
}