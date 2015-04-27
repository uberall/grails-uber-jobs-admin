(function(){
  "use strict";  
}());


var JobMetaStore = {

  basePath: "jobmetas",

  list: function(sort, order, max, offset, success) {
    $.ajax({
      url: window.baseUrl + "/" + this.basePath,
      data: {
        sort: sort,
        order: order,
        max: max,
        offset: offset
      },
      success: success
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
  }

};