var BaseService = require('./BaseService');

CuePointsService = function (app) {
    this.app = app;
};

CuePointsService.prototype = new BaseService();

CuePointsService.prototype.addCuePoints = function (type, cuepoint, callback) {
    domain.CuePoints.findOne({
        videoType: type
    }, function (err, obj) {
        if (err) {
            callback(err, null);
        } else if (!obj) {
            var cuePoint = new domain.CuePoints(cuepoint);
            cuePoint.save(function (err, obj) {
                callback(err, obj);
            });
        } else {
            CuePointsService.prototype.updateCuePoints(type, cuepoint, function (err, obj) {
                callback(err, obj);
            });
        }
    });

}

CuePointsService.prototype.getCuePoints = function (type, callback) {
    domain.CuePoints.find({}, function (err, obj) {
        callback(err, obj);
    });
}

CuePointsService.prototype.updateCuePoints = function (type, cuepoint, callback) {
    domain.CuePoints.findOneAndUpdate({
        videoType: type
    }, cuepoint, {
        new: true
    }, function (err, obj) {
        callback(err, obj);
    });
}
module.exports = function (app) {
    return new CuePointsService(app);
};
