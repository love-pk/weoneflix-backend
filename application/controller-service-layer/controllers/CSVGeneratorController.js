module.exports = function () {

    var generateCSV = function (req, res, callback) {
        this.services.csvGeneratorService.generateCSV({
            adId: req.query.adId,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        }, callback);
    }

    return {
        generateCSV: generateCSV
    }
};
