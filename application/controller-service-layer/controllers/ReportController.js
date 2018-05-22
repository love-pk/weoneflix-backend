module.exports = function () {

    var createReport = function (req, res, callback) {
        var report = req.body.report;
        report.reportedBy = req.loggedInUser._id;
        report.status = "Pending";
        this.services.reportService.createReport(report, callback);
    }
    var getReport = function (req, res, callback) {
        var skip = req.query.skip;
        var limit = req.query.limit;
        this.services.reportService.getReport(skip, limit, callback);
    }

    var updateStatus = function (req, res, callback) {
        var reportId = req.query.id;
        var status = req.query.status;
        this.services.reportService.updateStatus(status, reportId, callback);
    }

    var getReportDetail = function (req, res, callback) {
        var reportId = req.params.id;
        this.services.reportService.getReportDetail(reportId, callback);
    }

    return {
        createReport: createReport,
        getReport: getReport,
        updateStatus: updateStatus,
        getReportDetail: getReportDetail
    }
};
