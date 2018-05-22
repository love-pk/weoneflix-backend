var BaseService = require('./BaseService');

ReportService = function (app) {
    this.app = app;
};

ReportService.prototype = new BaseService();

ReportService.prototype.createReport = function (report, callback) {
    var report = new domain.Report(report);
    report.save(function (err, obj) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, obj);
        }
    });
}

var getReport = function (next, skip, limit) {
    domain.Report.find({
        status: 'Pending'
    }).populate([{
        path: 'reportedBy',
        select: "firstName"
    }, {
        path: 'content_id',
        populate: {
            path: 'videoID',
            model: 'Video',
            select: 'videoName'
        }
    }]).skip(skip * limit).limit(limit).exec(function (err, obj) {
        if (err) {
            next(err, null);
        } else {
            next(null, obj);
        }
    });
}
var countTotalReports = function (next) {
    domain.Report.aggregate({
        $match: {
            status: 'Pending'
        }
    }, {
        $group: {
            _id: null,
            totalReports: {
                $sum: 1
            }
        }
    }, function (err, totalReports) {
        if (err) {
            next(err, null);
        } else {
            next(null, totalReports);
        }
    });
}
var aggregatereportInfo = function (totalReports, reportCount, next) {
    var infoObject = {};
    if (reportCount.length > 0) {
        infoObject.reportCount = reportCount[0].totalReports;
    } else {
        infoObject.reportCount = 0;
    }
    infoObject.totalReports = totalReports;
    next(null, infoObject);

}
ReportService.prototype.getReport = function (skip, limit, callback) {
    async.auto({
            getReport: function (next) {
                getReport(next, skip, limit);
            },
            countTotalReports: function (next) {
                countTotalReports(next);
            },
            aggregatereportInfo: ['getReport', 'countTotalReports', function (next, results) {
                var totalReports = results.getReport;
                var reportCount = results.countTotalReports;
                aggregatereportInfo(totalReports, reportCount, next);
                }],
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.aggregatereportInfo);
            }
        });
}
var deleteComment = function (next, commentId) {
    domain.Comment.remove({
        _id: commentId
    }, function (err, comment) {
        next(err, comment);
    });
}
var updateStatusOfReport = function (next, reportId) {
    domain.Report.findOneAndUpdate({
            _id: reportId
        }, {
            status: "ActionTaken"
        }, {
            new: true
        },
        function (err, obj) {
            if (err) {
                next(err, null);
            } else {
                next(null, obj);
            }
        });
}

ReportService.prototype.updateStatus = function (status, reportId, callback) {
    async.auto({
            updateStatusOfReport: function (next, results) {
                console.log(typeof (next));
                updateStatusOfReport(next, reportId);
            },
            deleteComment: ['updateStatusOfReport', function (next, results) {
                var commentId = results.updateStatusOfReport.content_id;
                if (commentId && status == "ActionTaken") {
                    deleteComment(next, commentId);
                } else {
                    next(null, null);
                }
            }]
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.updateStatusOfReport);
            }
        });
}

ReportService.prototype.getReportDetail = function (reportId, callback) {
    domain.Report.find({
        _id: reportId,
        status: 'Pending'
    }).populate([{
        path: 'reportedBy',
        select: "firstName"
    }, {
        path: 'content_id',
        populate: {
            path: 'videoID',
            model: 'Video',
            select: 'videoName'
        }
    }]).exec(function (err, obj) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, obj);
        }
    });
}
module.exports = function (app) {
    return new ReportService(app);
};
