(function(){
  "use strict";  
}());


var JobMetaStore = {

  basePath: "jobmetas",
  _jobs: {},

  list: function(sort, order, max, offset, success) {
    $.ajax({
      url: window.baseUrl + "/" + this.basePath,
      data: {
        sort: sort,
        order: order,
        max: max,
        offset: offset
      },
      success: function (response) {
        _.each(response.list, function (job) {
          this._addToJobs(job)
        }.bind(this))
        if(success !== undefined){
          success(response)
        }
      }.bind(this)
    });
  },

  get: function(id, success, error){
    $.ajax({
      url: window.baseUrl + "/" + this.basePath + "/" + id,
      success: success,
      error: error
    })
  },

  update: function(jobMeta, success, error){
    $.ajax({
      url: window.baseUrl + "/" + this.basePath + "/" + jobMeta.id,
      method: "PUT",
      contentType : "application/json",
      data: JSON.stringify(jobMeta),
      success: success,
      error: error
    })
  },

  get: function (id, success) {
    if (this._jobs[id] === undefined) {
            $.ajax({
                url: window.baseUrl + "/" + this.basePath + "/" + id,
                success: function (resp) {
                    this._addToJobs(resp.jobMeta);
                    success(resp.jobMeta)
                }.bind(this)
            })
        } else {
            success(this._jobs[id])
        }
  },

  _addToJobs: function (job) {
      this._jobs[job.id] = job;
  },

};