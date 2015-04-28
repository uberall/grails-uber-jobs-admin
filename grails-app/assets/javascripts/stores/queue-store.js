'use strict';

var QueueStore = {
    _queues: {},
    _total: {},

    basePath: "queues",

    list: function (sort, order, max, offset, success) {
        $.ajax({
            url: window.baseUrl + "/" + this.basePath,
            data: {sort: sort, order: order, max: max, offset: offset},
            success: function (resp) {
                var list = resp.list;
                this._total = resp.total;

                for (var i = 0; i < list.length; i++) {
                    this._addToQueues(list[i]);
                }

                success(resp)

            }.bind(this)
        })
    },

    get: function (id, callback) {
        if (this._queues[id] === undefined) {
            $.ajax({
                url: window.baseUrl + "/" + this.basePath + "/" + id,
                success: function (resp) {
                    this._addToQueues(resp.queue);
                    callback(resp.queue)
                }.bind(this)
            })
        } else {
            callback(this._queues[id])
        }
    },

    _addToQueues: function (queue) {
        this._queues[queue.id] = queue;
    },

}