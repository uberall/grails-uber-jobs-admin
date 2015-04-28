(function(){
  "use strict";  
}());

var JobStore = {

  basePath: "jobs",

  list: function(sort, order, max, offset, statusses, success) {
    $.ajax({
      url: window.baseUrl + "/" + this.basePath,
      data: {
        sort: sort,
        order: order,
        max: max,
        offset: offset,
        status: statusses
      },
      success: success
    });
  },

  enqueue: function(job, success){
    $.ajax({
      url: window.baseUrl + "/" + this.basePath,
      method: "POST",
      contentType : "application/json",
      data: JSON.stringify(job),
      success: success
    });
  },

  get: function (jobId, success) {
    $.ajax({
      url: window.baseUrl + "/" + this.basePath + "/" + jobId,
      contentType : "application/json",
      success: success
    });
  },

  getFailure: function (jobId, success) {
    $.ajax({
      url: window.baseUrl + "/" + this.basePath + "/" + jobId + "/failure",
      contentType : "application/json",
      success: success
    });
  }
};