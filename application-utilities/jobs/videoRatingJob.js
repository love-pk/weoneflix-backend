module.exports = function () {

    var jobs = new CronJob({
        cronTime: ' 59 59 23 * * 0-6', //Sec,Min,H:Day of Month: 1-31 Months: 0-11 Day of Week: 0-6
        onTick: function () {
            VideoRatingJob();
        },
        start: false,
        timeZone: 'Asia/Kolkata'
    });

    jobs.start();

    var VideoRatingJob = function () {
        //        var today = new Date(); // when we have large no of videos then we will use this
        //        var yesterday = new Date();
        //        yesterday.setDate(today.getDate() - 1);
        //        today = today.toISOString();
        var videoID = []
        async.auto({

                getVideoId: function (next, results) {
                    domain.Video.find({
                        //                        updatedAt: {
                        //                            $lte: today,
                        //                            $gte: yesterday
                        //                        }
                    }, function (err, videoIds) {
                        next(null, videoIds)
                    }).select({
                        _id: 1,
                        averageRating: 1,
                        images: -1
                    })
                },
                getRatings: ['getVideoId', function (next, results) {
                    var iteration = 0;
                    async.whilst(
                        function () {
                            return iteration < results.getVideoId.length;
                        },
                        function (callback) {
                            var videoIDtoUpdateRatings = results.getVideoId[iteration]._id
                            domain.VideoRating.aggregate([
                                {
                                    $match: {
                                        videoID: videoIDtoUpdateRatings
                                    }
                                },
                                {
                                    $group: {
                                        _id: "$videoID",
                                        avrg: {
                                            $avg: "$rating"
                                        }
                                    }
                                    },
                                ], function (err, newRating) {
                                if (newRating.length > 0)
                                    calculateVideoRatings(newRating, function (error, response) {
                                        callback(error, response);
                                    })
                            })
                            iteration++;
                            callback(false, null);

                        },
                        function (err) {
                            if (!err) {
                                console.log("job successfully completed");
                            }
                        });
                    }]

            }),
            function (err, res) {}

        function calculateVideoRatings(newRating, ratingCallback) {

            domain.Video.findOneAndUpdate({
                    _id: newRating[0]._id,
                }, {
                    'averageRating': newRating[0].avrg
                }, null,
                function (err, success) {
                    if (err) {
                        console.log(err)
                        ratingCallback(true, err)
                    } else {
                        ratingCallback(null, "Ratings Success")
                    }
                });
        }
    };
};
