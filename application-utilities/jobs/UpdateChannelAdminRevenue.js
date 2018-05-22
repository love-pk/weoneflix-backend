module.exports = function () {
    var jobs = new CronJob({
        cronTime: '00 0-60/60 * * * *', //Sec,Min,H:Day of Month: 1-31 Months: 0-11 Day of Week: 0-6
        onTick: function () {
            updateRevenue();
        },
        start: false,
        timeZone: 'Asia/Kolkata'
    });

    jobs.start();

    var findAllChannelAdmin = function (next) {
        domain.User.find({
            role: 'Role_Channel_Admin'
        }, function (err, users) {
            next(err, users);
        });
    }

    var updateUser = function (userId, totalRevenueEarned, callback) {
        domain.User.findOneAndUpdate({
            _id: userId
        }, {
            totalRevenueEarned: totalRevenueEarned
        }, {
            new: true
        }, function (err, user) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, user);
            }
        });

    }

    var findTotalRevenueEarnedByChannelAdmin = function (next, users) {
        async.each(users, function (user, callback) {
                domain.AdTransactionHistory.aggregate({
                        $match: {
                            channelAdminId: user._id,
                            completed: true
                        }
                    }, {
                        $group: {
                            _id: null,
                            totalRevenueEarned: {
                                $sum: "$channelAdminRevenue"
                            }
                        }
                    },
                    function (err, obj) {
                        if (err) {
                            callback(err, null);
                        } else {
                            updateUser(user._id, obj[0].totalRevenueEarned, callback);
                        }
                    });
            },
            function (err) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, null)
                }
            });
    }

    var updateRevenue = function () {
        async.auto({
                findAllChannelAdmin: function (next) {
                    findAllChannelAdmin(next);
                },
                findTotalRevenueEarnedByChannelAdmin: ['findAllChannelAdmin', function (next, results) {
                    if (results.findAllChannelAdmin.length) {
                        findTotalRevenueEarnedByChannelAdmin(next, results.findAllChannelAdmin);
                    }
            }],
            },
            function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('Successfully updated channel admin revenue');
                }
            });
    }
};
