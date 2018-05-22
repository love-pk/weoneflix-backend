var BaseService = require('./BaseService');

DasboardService = function (app) {
    this.app = app;
};

DasboardService.prototype = new BaseService();

var findAllChannelsOfChannelAdmin = function (id, next) {
    domain.Channel.find({
        userId: id
    }, function (err, channels) {
        next(err, channels);
    });
}

var fetchAllVideosInfo = function (findQuery, next) {
    domain.Video.aggregate({
        $match: findQuery
    }, {
        $group: {
            _id: null,
            totalViews: {
                $sum: "$views"
            },
            totalCompleteViews: {
                $sum: "$completeViews"
            },
            totalVideos: {
                $sum: 1
            }
        }
    }, function (err, videoInfo) {
        if (err) {
            next(err, null);
        } else {
            next(null, videoInfo);
        }
    });
}

var getTopAdvertisements = function (adQuery, next) {
    domain.Advertisement.find(adQuery).sort({
        completeViews: -1
    }).limit(5).exec(function (err, ads) {
        next(err, ads);
    });
}

var getTopVideos = function (findQuery, next) {
    domain.Video.find(findQuery).sort({
        completeViews: -1
    }).limit(5).exec(function (err, videos) {
        next(err, videos);
    });
}

var getTopVideoOfChannels = function (id, next) {
    domain.Video.aggregate([{
            $match: {
                user_id: id
            }
        }, {
            $group: {
                _id: '$channelId',
                video: {
                    $first: {
                        videoId: '$_id',
                        videoName: '$videoName',
                        images: '$images',
                        views: '$views',
                        completeViews: '$completeViews'
                    }
                },
            }
        }, {
            $project: {
                videoID: '$video.videoId',
                completeViews: '$video.completeViews',
                channelId: '$_id',
                videoName: '$video.videoName',
                images: '$video.images',
                views: '$video.views'
            }
        }, {
            "$sort": {
                "completeViews": -1
            }
        }],
        function (err, data) {
            if (err) {
                next(err, null);
            } else {
                domain.Channel.populate(data, {
                    path: 'channelId',
                    select: 'channelName images'
                }, function (err, populatedVideos) {
                    if (err) {
                        next(err, null);
                    } else {
                        console.log('populated data', populatedVideos);
                        next(null, populatedVideos);
                    }
                });
            }
        });
}


var aggregateChannelAdminDashboardInfo = function (channelArray, videoInfo, topAds, topVideos, topVideoByChannel, next) {

    var infoObject = {};
    if (videoInfo.length > 0) {
        infoObject.totalVideos = videoInfo[0].totalVideos;
        infoObject.totalViews = videoInfo[0].totalViews;
        infoObject.totalCompleteViews = videoInfo[0].totalCompleteViews;
    } else {
        infoObject.totalVideos = 0;
        infoObject.totalViews = 0;
        infoObject.totalCompleteViews = 0;
    }
    infoObject.totalChannels = channelArray.length;
    infoObject.topAds = topAds;
    infoObject.topVideos = topVideos;
    infoObject.topVideoByChannel = topVideoByChannel;

    next(null, infoObject);
}

/*
 * This function is used to fetch data for channel Admin dashboard.
 * finds all channels of channel admin.
 * Calculate total number of videos, total video views and total complete views.
 * find top advertisements of channel admin.
 * find top videos of channel admin.
 * find top video channel wise of channel admin.
 */
DasboardService.prototype.getChannelAdminDashboard = function (id, callback) {

    async.auto({
            findAllChannelsOfChannelAdmin: function (next, results) {
                findAllChannelsOfChannelAdmin(id, next);
            },
            getTopVideoOfChannels: ['findAllChannelsOfChannelAdmin', function (next, results) {
                ///var channels = results.findAllChannelsOfChannelAdmin;
                //if (channels.length > 0) {
                // getTopVideoOfChannels(channels, next);
                getTopVideoOfChannels(id, next);

                //} else {
                //next(null, []);
                //}
            }],
            fetchAllVideosInfo: function (next, results) {
                var findQuery = {
                    user_id: id
                };
                fetchAllVideosInfo(findQuery, next);
            },
            getTopAdvertisements: function (next, results) {
                var adQuery = {
                    user_id: id
                };
                getTopAdvertisements(adQuery, next);
            },
            getTopVideos: function (next, results) {
                var findQuery = {
                    user_id: id
                };
                getTopVideos(findQuery, next);
            },
            aggregateChannelAdminDashboardInfo: ['findAllChannelsOfChannelAdmin', 'fetchAllVideosInfo', 'getTopAdvertisements', 'getTopVideoOfChannels', 'getTopVideos', function (next, results) {
                var channelArray = results.findAllChannelsOfChannelAdmin;
                var videoInfo = results.fetchAllVideosInfo;
                var topAds = results.getTopAdvertisements;
                var topVideos = results.getTopVideos;
                var topVideoByChannel = results.getTopVideoOfChannels;
                aggregateChannelAdminDashboardInfo(channelArray, videoInfo, topAds, topVideos, topVideoByChannel, next);
                }]
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.aggregateChannelAdminDashboardInfo);
            }
        }
    );
}

var aggregateAdvertisementAdminDashboardInfo = function (topAds, adsInfo, next) {
    var infoObject = {};
    if (adsInfo.length > 0) {
        infoObject.totalAds = adsInfo[0].totalAds;
        infoObject.totalViews = adsInfo[0].totalViews;
        infoObject.totalCompleteViews = adsInfo[0].totalCompleteViews;
        infoObject.totalViewsPurchased = adsInfo[0].totalViewsPurchased;
        infoObject.remainingAdViews = adsInfo[0].remainingAdViews;
    } else {
        infoObject.totalAds = 0;
        infoObject.totalViews = 0;
        infoObject.totalCompleteViews = 0;
        infoObject.totalViewsPurchased = 0;
        infoObject.remainingAdViews = 0;
    }
    infoObject.topAds = topAds;
    next(null, infoObject);

}

/*
 * This function is used to fetch data for advertisement Admin dashboard.
 * find top advertisements.
 */
DasboardService.prototype.getAdvertisementAdminDashboard = function (id, callback) {

    async.auto({
            getTopAdvertisements: function (next, results) {
                var adQuery = {
                    user_id: id
                };
                getTopAdvertisements(adQuery, next);
            },
            fetchAllAdvertisementInfo: function (next, results) {
                var adQuery = {
                    user_id: id
                };
                fetchAllAdvertisementInfo(adQuery, next);
            },
            aggregateAdvertisementAdminDashboardInfo: ['getTopAdvertisements', 'fetchAllAdvertisementInfo', function (next, results) {
                var topAds = results.getTopAdvertisements;
                var adsInfo = results.fetchAllAdvertisementInfo;
                aggregateAdvertisementAdminDashboardInfo(topAds, adsInfo, next);
                }],
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.aggregateAdvertisementAdminDashboardInfo);
            }
        }
    );
}

var fetchAllAdvertisementInfo = function (adQuery, next) {
    domain.Advertisement.aggregate([{
        $match: adQuery
        }, {
        $group: {
            _id: null,
            totalViews: {
                $sum: "$views"
            },
            totalCompleteViews: {
                $sum: "$completeViews"
            },
            totalViewsPurchased: {
                $sum: "$viewsPurchased"
            },
            totalAds: {
                $sum: 1
            },
            totalAdAmount: {
                $sum: {
                    $multiply: ["$viewsPurchased", "$viewPrice"]
                }
            }
        }
        }, {
        $project: {
            remainingAdViews: {
                $subtract: ["$totalViewsPurchased", "$totalCompleteViews"]
            },
            totalViews: "$totalViews",
            totalViewsPurchased: "$totalViewsPurchased",
            totalCompleteViews: "$totalCompleteViews",
            totalAds: "$totalAds",
            totalAdAmount: '$totalAdAmount'
        }
        }]).exec(function (err, ads) {
        if (err) {
            next(err, null);
        } else {
            next(null, ads);
        }
    });
}

function getRevenueGenerated(next) {
    domain.AdTransactionHistory.aggregate([{
        $match: {
            completed: true
        }
        }, {
        $group: {
            _id: null,
            siteAdminRevenue: {
                $sum: "$siteAdminRevenue"
            },
            channelAdminRevenue: {
                $sum: "$channelAdminRevenue"
            }
        }
    }], function (err, data) {
        if (err || !data.length) {
            next(err, null);
        } else {
            console.log('data', data);
            var siteAdminRevenue = data[0].siteAdminRevenue;
            var channelAdminRevenue = data[0].channelAdminRevenue;
            var totalRevenue = siteAdminRevenue + channelAdminRevenue;
            console.log('revenue', data);
            next(null, {
                siteAdminRevenue: siteAdminRevenue,
                channelAdminRevenue: channelAdminRevenue,
                totalRevenue: totalRevenue
            });
        }
    });
}

function getTotalRedeemedAmount(next) {
    domain.Payment.aggregate([{
        $match: {
            status: 'Approved'
        }
        }, {
        $group: {
            _id: null,
            amount: {
                $sum: "$amount"
            }
        }
    }], function (err, data) {
        if (err || !data.length) {
            next(err, null);
        } else {
            next(null, {
                amount: data[0].amount
            });
        }
    });
}

var aggregateRevenueDashboardInfo = function (adsInfo, revenueGenerated, totalRedeemedAmount, next) {
    var infoObject = {};
    if (adsInfo.length > 0) {
        infoObject.totalAds = adsInfo[0].totalAds;
        infoObject.totalViews = adsInfo[0].totalViews;
        infoObject.totalCompleteViews = adsInfo[0].totalCompleteViews;
        infoObject.totalViewsPurchased = adsInfo[0].totalViewsPurchased;
        infoObject.remainingAdViews = adsInfo[0].remainingAdViews;
        infoObject.totalAdAmount = adsInfo[0].totalAdAmount;
    } else {
        infoObject.totalAds = 0;
        infoObject.totalViews = 0;
        infoObject.totalCompleteViews = 0;
        infoObject.totalViewsPurchased = 0;
        infoObject.remainingAdViews = 0;
        infoObject.totalAdAmount = 0;
    }
    if (revenueGenerated) {
        infoObject.totalChannelAdminRevenue = revenueGenerated.channelAdminRevenue;
        infoObject.totalSiteAdminRevenue = revenueGenerated.siteAdminRevenue;
        infoObject.totalRevenue = revenueGenerated.totalRevenue;
    } else {
        infoObject.totalChannelAdminRevenue = 0;
        infoObject.totalSiteAdminRevenue = 0;
        infoObject.totalRevenue = 0;
    }

    if (totalRedeemedAmount) {
        infoObject.totalRedeemedAmount = totalRedeemedAmount.amount;
    } else {
        infoObject.totalRedeemedAmount = 0;
    }

    next(null, infoObject);
}

/*
 * This function is used to fetch data for revenue dashboard.
 *  Calculate total number of views purchased, total ads views and total remaining ads views.
 */
DasboardService.prototype.getRevenueDashboard = function (id, callback) {
    async.auto({
            fetchAllAdvertisementInfo: function (next, results) {
                var adQuery = {
                    uploadStatus: 'approved'
                };
                fetchAllAdvertisementInfo(adQuery, next);
            },
            getRevenueGenerated: function (next, results) {
                getRevenueGenerated(next);
            },
            getTotalRedeemedAmount: function (next, results) {
                getTotalRedeemedAmount(next);
            },
            aggregateRevenueDashboardInfo: ['fetchAllAdvertisementInfo', 'getRevenueGenerated', 'getTotalRedeemedAmount', function (next, results) {
                var adsInfo = results.fetchAllAdvertisementInfo;
                var revenueGenerated = results.getRevenueGenerated;
                var totalRedeemedAmount = results.getTotalRedeemedAmount;
                aggregateRevenueDashboardInfo(adsInfo, revenueGenerated, totalRedeemedAmount, next);
            }],
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.aggregateRevenueDashboardInfo);
            }
        }
    );
}

var aggVideosChannelWise = function (id, next) {
    domain.Video.aggregate([{
                $match: {
                    user_id: id
                }
            },
            {
                $group: {
                    _id: '$channelId',
                    info: {
                        $push: {
                            videoId: '$_id'
                        }
                    }
                }
            },

            {
                $project: {
                    videoID: '$info.videoId'

                }
            }
                           ],
        function (err, data) {
            if (err) {
                next(err, null);
            } else {
                console.log(data)
                next(null, data);
            }
        });
}

DasboardService.prototype.getRevenueVideoWise = function (id, next) {
    domain.AdTransactionHistory.aggregate([{
        $match: {
            channelAdminId: id,
            completed: true
        }
            }, {
        $group: {
            _id: '$videoId',
            totalAmount: {
                $sum: '$channelAdminRevenue'
            },
            totalNumber: {
                $sum: 1
            }
        }
        }, {
        "$sort": {
            "totalAmount": -1
        }
        }], function (err, data) {
        if (err) {
            next(err, null);
        } else {
            next(null, data);
        }
    });
}

var getRevenueChannelWise = function (id, next) {
    domain.AdTransactionHistory.aggregate([{
        $match: {
            channelAdminId: id,
            completed: true
        }
            }, {
        $group: {
            _id: '$channelId',
            totalAmount: {
                $sum: '$channelAdminRevenue'
            },
            totalNumber: {
                $sum: 1
            }
        }
        }, {
        "$sort": {
            "totalAmount": -1
        }
        }], function (err, data) {
        if (err) {
            next(err, null);
        } else {
            next(null, data);
        }
    });
}

var getTotalProfit = function (id, next) {
    domain.AdTransactionHistory.aggregate([{
                $match: {
                    channelAdminId: id,
                    completed: true
                }
                },
            {
                $group: {
                    _id: '$channelAdminId',
                    totalAmount: {
                        $sum: "$channelAdminRevenue"
                    },
                    totalViews: {
                        $sum: 1
                    }
                }
            }],
        function (err, data) {
            if (err) {
                next(err, null);
            } else {
                domain.User.findOne({
                    _id: id
                }, function (err, user) {
                    if (err) {
                        next(err, null);
                    } else {
                        next(null, {
                            totalProfit: user.totalRevenueEarned,
                            totalViews: data.length ? data[0].totalViews : 0
                        });
                    }
                });
            }
        });
}

var appendChannelNames = function (req, next) {
    var count = 0;
    var channelInfo = []
    async.whilst(
        function () {
            return count < req.length;
        },
        function (callback) {
            var map = {};
            map["channelId"] = req[count]._id;
            map["totalAmount"] = req[count].totalAmount;
            map["totalNumber"] = req[count].totalNumber;
            var channelId = req[count]._id;
            domain.Channel.find({
                _id: channelId
            }).exec(function (err, channel) {
                map["channelName"] = channel[0].channelName;
                map["channelImage"] = channel[0].images.thumbnail;
                channelInfo.push(map)
                count++;
                callback(null, count);
            });
        },
        function (err, n) {
            next(null, channelInfo);
        }
    );
}

DasboardService.prototype.appendVideoNames = function (req, next) {
    var count = 0;
    var videoInfo = []
    async.whilst(
        function () {
            return count < req.length;
        },
        function (callback) {
            var map = {};
            map["videoId"] = req[count]._id;
            map["totalAmount"] = req[count].totalAmount;
            map["totalNumber"] = req[count].totalNumber;
            var videoId = req[count]._id;
            domain.Video.find({
                _id: videoId
            }).exec(function (err, video) {
                map["videoName"] = video[0].videoName;
                map["videoImage"] = video[0].images.thumbnail;
                videoInfo.push(map)
                count++;
                callback(null, count);
            });
        },
        function (err, n) {
            next(null, videoInfo);
        });
}


var getChannelAdminRevenue = function (id, next) {
    domain.Payment.aggregate([{
                $match: {
                    userId: id
                }
            },
            {
                $group: {
                    _id: '$userId',
                    amountRedeemed: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$status", "Approved"]
                                },
                                then: "$amount",
                                else: 0
                            }
                        }
                    },
                    amountInProcess: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$status", "pending"]
                                },
                                then: "$amount",
                                else: 0
                            }
                        }
                    }
                }
        }],
        function (err, data) {
            if (err) {
                next(err, null);
            } else {
                next(null, data);
            }
        });
}

DasboardService.prototype.getChannelAdminRevenueDashboard = function (id, callback) {
    async.auto({
            getTotalProfit: function (next, results) {
                getTotalProfit(id, next);
            },
            getChannelAdminRevenue: function (next, results) {
                getChannelAdminRevenue(id, next);
            },
            videoWiseRevenue: function (next, results) {
                DasboardService.prototype.getRevenueVideoWise(id, next);
            },
            channelWiseRevenue: function (next, results) {
                getRevenueChannelWise(id, next);
            },
            Channel: ['channelWiseRevenue', function (next, results) {
                appendChannelNames(results.channelWiseRevenue, next);
            }],
            Video: ['videoWiseRevenue', function (next, results) {
                DasboardService.prototype.appendVideoNames(results.videoWiseRevenue, next);
            }],
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                var response = {};
                if (results.getTotalProfit) {
                    response.totalViews = results.getTotalProfit.totalViews;
                    response.totalProfit = results.getTotalProfit.totalProfit;
                } else {
                    response.totalViews = 0;
                    response.totalProfit = 0;
                }
                if (results.getChannelAdminRevenue.length) {
                    var amountRedeemed = results.getChannelAdminRevenue[0].amountRedeemed;
                    var amountInProcess = results.getChannelAdminRevenue[0].amountInProcess;
                    var totalProfit = results.getTotalProfit.totalProfit;
                    response.amountRedeemed = amountRedeemed;
                    response.amountInProcess = amountInProcess;
                    response.remainingAmount = totalProfit - (amountRedeemed + amountInProcess);
                } else {
                    response.amountRedeemed = 0;
                    response.amountInProcess = 0;
                    response.remainingAmount = results.getTotalProfit.totalProfit ? results.getTotalProfit.totalProfit : 0;
                }
                response.channelInfo = results.Channel.length ? results.Channel : [];
                response.videoInfo = results.Video.length ? results.Video : [];
                callback(null, response);
            }
        });
}

module.exports = function (app) {
    return new DasboardService(app);
};
