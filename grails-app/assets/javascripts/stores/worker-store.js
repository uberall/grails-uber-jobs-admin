'use strict';

var WorkerStore = {
	
	basePath: "workers",

	list: function(sort, order, max, offset, includeIdle, includeStopped, success){
		$.ajax({
			url: window.baseUrl + "/" + this.basePath,
			data: {sort: sort, order: order, max: max, offset:offset, includeIdle: includeIdle, includeStopped: includeStopped},
			success: success
		})
	},

	get: function(id, success, error){
		$.ajax({
			url: window.baseUrl + "/" + this.basePath +"/"+ id,
			success: success,
			error: error
		})
	},

	update: function(worker, success, error){
		$.ajax({
			url: window.baseUrl + "/" + this.basePath + "/" + worker.id,
			method: "PUT",
			contentType : "application/json",
			data: JSON.stringify(worker),
			success: success,
			error: error
		})
	},

	pause: function (worker, success) {
		$.ajax({
			url: window.baseUrl + "/" + this.basePath + "/" + worker.id + "/pause",
			method: "PUT",
			contentType : "application/json",
			success: success
		})	
	},

	stop: function (worker, success) {
		$.ajax({
			url: window.baseUrl + "/" + this.basePath + "/" + worker.id + "/pause",
			method: "PUT",
			contentType : "application/json",
			success: success
		})	
	},

	add: function (worker, success, error) {
		$.ajax({
			url: window.baseUrl + "/" + this.basePath + "/",
			method: "POST",
			contentType : "application/json",
			data: JSON.stringify(worker),
			success: success,
			error: error
		})
	}
}