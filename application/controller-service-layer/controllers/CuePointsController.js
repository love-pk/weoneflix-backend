module.exports = function () {

    var addCuePoints = function (req, res, callback) {
        var cuepoint = req.body;
        var type = req.query.type;
        this.services.cuePointsService.addCuePoints(type, cuepoint, callback);
    }

    var getCuePoints = function (req, res, callback) {
        var type = req.query.type;
        this.services.cuePointsService.getCuePoints(type, callback);
    }

    var updateCuePoints = function (req, res, callback) {
        var type = req.query.type;
        var cuepoint = req.body.cuepoint;
        this.services.cuePointsService.updateCuePoints(type, cuepoint, callback);
    }

    return {
        addCuePoints: addCuePoints,
        getCuePoints: getCuePoints,
        updateCuePoints: updateCuePoints
    }
};
