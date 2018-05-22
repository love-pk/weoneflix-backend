var BaseService = require('./BaseService');

ActivityService = function (app) {
    this.app = app;
};

ActivityService.prototype = new BaseService();

ActivityService.prototype.createActivity = function (activity, callback) {
    var activity = new domain.Activity(activity);
    activity.save(function (err, obj) {
        if (obj) {
            callback(err, obj);
        } else {
            callback(err, null);
        }
    });
}


ActivityService.prototype.deleteActivity = function (id, callback) {
    domain.Activity.remove({
        _id: id
    }, function (err, obj) {
        if (err) {
            callback(err, obj);
        } else {
            callback(err, obj);
        }
    });
}
module.exports = function (app) {
    return new ActivityService(app);
};
