var fs = require('fs');
var moment = require('moment');
var videoFolderPath = configurationHolder.appConstants.VideoFilePathOfMulter
module.exports = function () {
    var jobs = new CronJob({
        cronTime: ' 00 00 0-24/6 * * 0-6', //Sec,Min,H:Day of Month: 1-31 Months: 0-11 Day of Week: 0-6
        onTick: function () {
            videoDeleteJob();
        },
        start: false,
        timeZone: 'Asia/Kolkata'
    });

    jobs.start();

    var videoDeleteJob = function () {
        fs.readdir(videoFolderPath, function (err, items) {
            var count = 0;
            async.whilst(
                function () {
                    return count < items.length;
                },
                function (callback) {
                    var file = videoFolderPath + items[count];
                    fs.stat(file, function (err, data) {
                        var init = moment(data["mtime"])
                        var d = new Date();
                        var curTime = moment(d)
                        if (curTime.diff(init) > (1000 * 60 * 60 * 6)) {
                            fs.unlink(file);
                        }
                        count++;
                        callback(null, count);
                    });
                },
                function (err, n) {
                    console.log("temp videos deleted")
                });
        });
    }
};
