'use strict';
var JobMetaStore = {

	basePath: "jobmetas",

	list: function(sort, order, max, offset, success){
		$.ajax({
			url: window.baseUrl + "/" + this.basePath,
			data: {sort: sort, order: order, max: max, offset:offset},
			success: success
		})
	}
}