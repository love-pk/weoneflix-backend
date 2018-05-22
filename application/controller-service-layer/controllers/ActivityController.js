module.exports = function () {

    var createActivity = function (req, res, callback) {
        var activity = req.body.activity;
        this.services.activityService.createActivity(activity, callback);
    }
    var getActivity = function (req, res, callback) {
        var userid = req.params.id;
        this.services.activityService.getActivity(userid, callback);
    }

    var deleteActivity = function (req, res, callback) {
        var userId = req.params.userId;
        var activityId = req.params.activityId;
        this.services.activityService.deleteActivity(userId, activityId, callback);
    }

    return {

        createActivity: createActivity,
        getActivity: getActivity,
        deleteActivity: deleteActivity

    }
};
