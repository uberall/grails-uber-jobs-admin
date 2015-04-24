(function(){
  "use strict";  
}());


var TriggerStore = {

  basePath: "triggers",

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

  update: function(trigger, success, error){
    $.ajax({
      url: window.baseUrl + "/" + this.basePath + "/" + trigger.id,
      method: "PUT",
      contentType : "application/json",
      data: JSON.stringify(trigger),
      success: success,
      error: error
    })
  }

};