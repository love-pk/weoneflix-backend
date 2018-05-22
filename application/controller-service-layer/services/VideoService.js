var BaseService = require('./BaseService');
var fs = require('fs');
var kalturaService = require("./KalturaService");
var dashboardService = require("./DashboardService");


VideoService = function (app) {
    this.app = app;
};
VideoService.prototype = new BaseService();

VideoService.prototype.createVideo = function (video, callback) {

    var videoObj = new domain.Video({
        channelId: video.channelId,
        sourceName: video.originalname,
        size: video.size,
        filePath: video.filePath,
        images: {
            thumbnail: "/media/images/dummy_thumbnail.jpg",
            banner: "/media/images/dummy_banner.jpg"
        }
    });
    videoObj.save(function (err, response) {
        if (err) {
            callback(err, null);
        } else {
            video._id = response._id;
            callback(null, video);
        }

    });
}
VideoService.prototype.uploadVideo = function (response, video, callback) {
    video.save(function (err, videoObj) {
        callback(err, videoObj);
    });

}
VideoService.prototype.getVideo = function (videoId, callback) {
    domain.Video.findOne({
            _id: videoId,
            deleted: false
        }).populate("channelId").exec(
            function (err, video) {
                if (err) {
                    console.log("Errror is  videoService")
                } else {
                    callback(err, video);
                }
            }) //.select({videoName:1,sourcePath:1,categories:1});
}

VideoService.prototype.searchVideo = function (searchBy, value, callback) {
    var query = {};
    if (searchBy == 'videoName') {
        query.videoName = {};
        query.videoName = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'videoId') {
        query._id = {};
        query._id = value.length > 12 ? mongoose.Types.ObjectId(value) : null;
    }
    console.log('video search query', query);
    domain.Video.find(query).limit(10).populate({
        path: 'channelId',
        select: 'channelName'
    }).exec(function (err, video) {
        callback(err, video);
    });
}

VideoService.prototype.updateVideo = function (id, videoObject, callback) {
    console.log(videoObject, "to update the video");
    domain.Video.findOneAndUpdate({
            _id: id,
            deleted: false
        },
        videoObject, {
            new: true
        },
        function (err, video) {
            if (err) {
                console.log(video, " update video error");
                callback(err, null);
            } else {
                console.log(videoObject, "to update success");
                callback(null, video);
            }
        });
}

/* This method helps to get current video rating
 * to display on the screen when user click the video
 * find the video rating through userid and videoid
 */
VideoService.prototype.getVideoRating = function (user, videoId, callback) {
    var userid = user._id;
    domain.VideoRating.findOne({
            userid: userid,
            videoID: videoId
        },
        function (err, ratingObj) {
            if (err) {
                callback(err, null);
            } else if (ratingObj) {
                callback(null, ratingObj);
            } else {
                callback(null, null);
            }
        });
}

VideoService.prototype.getHeadBanner = function (category, callback) {
    var queryString = {};
    if (category == "Home") {
        queryString = {
            mainPage: true
        };
    } else {
        queryString = {
            category: category
        }
    }
    domain.HeadBanner.find(queryString).sort("-totalViews").limit(5).select('-createdAt -updatedAt -deletedAt -deleted -createdAt -_v').populate({
        path: 'videoID',
        select: '-status -updatedAt -deletedAt -deleted -createdAt -_v -completeViews -views'
    }).exec(function (err, video) {
        console.log("video: ", video);
        if (video) {
            if (video.length != 0)
                callback(false, video);
            else {
                var query = {};
                if (category == "Home") {
                    query = {};
                } else {
                    query = {
                        videoType: {
                            $in: category
                        }
                    }
                }
                domain.Video.find(query).limit(5).populate({
                    path: 'channelId',
                    select: 'channelName',
                    options: {
                        sort: '-releaseDate'
                    }
                }).exec(function (err, videos) {
                    callback(false, videos)
                })
            }
        } else {
            console.log("err: ", err);
            callback(true, err)
        }
    })

}

VideoService.prototype.getVideos = function (type, status, user, callback) {

    var typeList = type ? type.split(",") : [],
        statusList = status ? status.split(",") : [];
    console.log("typeList", typeList);
    console.log("statusList", statusList);

    async.parallel({
            popular: function (callback) {
                _.contains(statusList, 'popular') ? getMostPopularVideosByType(typeList, function (err, videos) {
                    if (!err) {
                        callback(null, videos);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            },
            recent: function (callback) {
                _.contains(statusList, 'recent') ? getRecentReleasedVideosByType(typeList, function (err, videos) {
                    if (!err) {
                        callback(null, videos);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            }
        },
        function (err, results) {
            if (user != null) {
                getVideosByChannel(user, typeList, results, function (videos) {
                    callback(false, videos);
                })
            } else {
                callback(false, results);
            }
        });
}


function getVideosByChannel(user, typeList, popularRecents, callback) {
    var videosToSend = popularRecents;
    var subscribedChannels = user.channelSubscribed;
    var typeQuery = {};
    if (typeList.length > 0) {
        typeQuery = {
            videoType: {
                $in: typeList
            }
        }
    };
    var iteration = 0;
    async.whilst(function () {
            return iteration < subscribedChannels.length;
        },
        function (whilstCallback) {
            async.auto({
                    // get channel name from channel id
                    getChannelName: function (next, results) {
                        var searchQuery = {
                            _id: subscribedChannels[iteration]
                        };
                        domain.Channel.findOne(searchQuery, 'channelName', function (err, channelInfo) {
                            next(null, channelInfo);
                        })
                    },
                    // get channel video
                    getChannelVideos: ['getChannelName', function (next, results) {
                        var searchQuery = {
                            channelId: subscribedChannels[iteration]
                        }
                        if (typeList.length > 0) {
                            var query = jsonConcat(searchQuery, typeQuery);
                        } else {
                            var query = searchQuery;
                        }
                        domain.Video.find(query).populate({
                                path: 'channelId',
                                select: 'channelName',
                                options: {
                                    sort: '-releaseDate'
                                }
                            }).limit(10).exec(function (err, videos) {
                                console.log("videos length", videos.length)
                                if (videos.length > 0) {
                                    videosToSend[results.getChannelName.channelName] = videos
                                }
                                next(null, videos);
                            }) //.sort('-releaseDate').limit(10);
                    }]
                },
                function (err, results) {
                    iteration++;
                    whilstCallback(null);
                });
        },
        function (err) {
            callback(videosToSend);
        });
}


function getMostPopularVideosByType(typeList, callback) {
    var searchQuery = {};
    if (typeList.length > 0) {
        searchQuery = {
            videoType: {
                $in: typeList
            },
            status: 'ready'
        }
    } else {
        searchQuery = {
            status: 'ready'
        }
    }
    domain.Video.find(searchQuery).limit(10).sort("-completeViews").populate({
        path: 'channelId',
        select: 'channelName',
        options: {
            sort: '-releaseDate'
        }
    }).exec(function (err, videos) {
        if (videos) {
            callback(null, videos)
        } else {
            callback(err, null)
        }
    });
}

function getRecentReleasedVideosByType(typeList, callback) {
    var searchQuery = {};
    if (typeList.length > 0) {
        searchQuery = {
            videoType: {
                $in: typeList
            },
            status: 'ready'
        }
    } else {
        searchQuery = {
            status: 'ready'
        }
    }

    domain.Video.find(searchQuery).limit(10).sort("-releaseDate").populate({
        path: 'channelId',
        select: 'channelName',
    }).exec(function (err, videos) {
        if (videos) {
            callback(null, videos)
        } else {
            callback(err, [])
        }
    });
}


function getAllChannelsSubscribedByUser(userId, callback) {
    domain.User.findOne({
            _id: id,
        },
        function (err, user) {
            if (err) {
                callback(false, null);
            } else {
                callback(true, user.subsribedChannel);
            }
        });
}

var deleteVideoComments = function (videoid, next) {
    console.log("Removing comments")
    domain.Comment.remove({
        videoID: videoid
    }, function (err, comment) {
        next(err, comment);
    });
}
var deleteVideofromKaltura = function (videoid, next) {
    var self = this;
    domain.Video.findOne({
        _id: videoid
    }, function (err, video) {
        if (err) {
            next(null, err);
        } else {
            console.log(videoid, "Going to del", video)
            KalturaService.prototype.deleteVideo(video.kalturaEntryId, function (err, data) {
                if (err) {
                    next(err, null);
                } else {
                    next(false, data);
                }
            });

        }
    });
}
var deleteVideoRatings = function (videoid, next) {
    console.log("Removing VideoRatings")
    domain.VideoRating.remove({
        videoID: videoid
    }, function (err, rating) {
        next(err, rating);
    });
}

var deleteVideoFileAndImages = function (videoid, next) {
    domain.Video.findOne({
        _id: videoid
    }, function (err, video) {
        if (err) {
            next(err, null);
        } else if (video == null || video == undefined) {
            next(new Error("video not found"), null);
        } else {
            var pathArray = [];
            var filePath = rootPath + "/public/media/videos/" + video.sourceName;
            var bannerPath = rootPath + "/public" + video.images.banner;
            //var thumbnailPath = rootPath + "/public" + video.images.thumbnail;
            pathArray.push(filePath);
            pathArray.push(bannerPath);
            //pathArray.push(thumbnailPath);

            var i = pathArray.length;
            pathArray.forEach(function (path) {
                fs.unlink(path, function (err) {
                    i--;
                    if (err) {
                        return next(err, null);
                    } else if (i <= 0) {
                        console.log("Files deleted successfully!");
                        next(null, video);
                    }
                });
            });
        }
    });
}

var deleteVideofromDB = function (videoid, next) {
    domain.Video.findOneAndRemove({
        _id: videoid
    }, function (err, video) {
        next(err, video);
    });
}

/* This function helps to delete a video
 * It deletes the following:
 * video Comments
 * video rating
 * video file and images
 * video document from db.
 */
VideoService.prototype.deleteVideo = function (videoid, callback) {
    async.auto({

            deleteVideoComments: function (next) {
                deleteVideoComments(videoid, next);
            },
            deleteVideofromKaltura: ['deleteVideoComments', function (next) {
                deleteVideofromKaltura(videoid, next);
            }],

            deleteVideoRatings: ['deleteVideofromKaltura', function (next) {
                deleteVideoRatings(videoid, next);
            }],
            deleteVideoFileAndImages: ['deleteVideoRatings', function (next) {
                deleteVideoFileAndImages(videoid, next);
            }],
            deleteVideofromDB: ['deleteVideoFileAndImages', function (next) {
                deleteVideofromDB(videoid, next);
            }]
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.deleteVideofromDB);
            }
        });
}

var VAST = require('vast-xml');

VideoService.prototype.generateVastXML = function (videoId, res, callback) {

    domain.Advertisement.find({
        uploadStatus: "approved",
        remainingViews: {
            $gt: 0
        }
    }, function (err, ads) {
        if (err) {
            callback(err, null);
        } else {
            console.log("Number of Ads: ", ads.length);
            var numberOfAds = ads.length;
            var adIndex = _.random(0, numberOfAds - 1);
            var adURL = ads[adIndex].url;
            sendVastXMLResponse(res, adURL);
        }
    });
}

function sendVastXMLResponse(res, adURL) {

    var vast = new VAST();
    var ad = vast.attachAd({
        id: 1,
        structure: 'inline',
        sequence: 99,
        Error: 'http://error.err',
        Extensions: ['<xml>data</xml>'],
        AdTitle: 'Common name of the ad',
        AdSystem: {
            name: 'Test Ad Server',
            version: '1.0'
        }
    });
    var creative = ad.attachCreative('Linear', {
        id: 2,
        AdParameters: '<xml></xml>',
        Duration: '00:00:30',
        skipoffset: '00:00:05'
    });
    creative.attachMediaFile(adURL, {
        id: 3,
        type: "video/mp4",
        bitrate: "320",
        minBitrate: "320",
        maxBitrate: "320",
        width: "640",
        height: "360",
        scalable: "true",
        maintainAspectRatio: "true",
        codec: "",
        apiFramework: "VPAID"
    });
    res.send(vast.xml({
        pretty: true,
        indent: '  ',
        newline: '\n'
    }));
    res.end();
}

VideoService.prototype.incrementVideoViews = function (videoId, incrementViews, callback) {
    var vid = videoId.trim()
    var query = {};
    if (incrementViews == 'views') {
        query = {
            $inc: {
                views: 1
            }
        }
    } else if (incrementViews == 'completeViews') {
        query = {
            $inc: {
                completeViews: 1
            }
        }
    }
    domain.Video.findOneAndUpdate({
            _id: vid
        }, query, {
            new: true
        },
        function (err, video) {
            callback(err, video);
        });
}

VideoService.prototype.getMoreVideos = function (type, category, channelId, skip, limit, callback) {
    var findQuery = findVideoQuery(category, channelId);
    var sortQuery = sortVideoQuery(type);
    console.log("Skip:" + skip + "limit:" + limit);
    domain.Video.find(findQuery).populate("channelId").skip(skip).limit(limit).sort(sortQuery).exec(function (err, videos) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, videos);
        }
    });
}

function findVideoQuery(category, channelId) {
    var findQuery = {};
    if (category != "" && category != undefined && category != null && category != "undefined") {
        findQuery.videoType = category;
        findQuery.status = "ready";
    } else {
        findQuery.status = "ready";
    }

    if (channelId != "" && channelId != null && channelId != undefined) {
        findQuery.channelId = channelId;
    }
    console.log("findquery", findQuery);
    return findQuery;
}

function sortVideoQuery(type) {
    var sortQuery = {};
    if (type == "recent") {
        sortQuery.releaseDate = -1;
    } else {
        sortQuery.views = -1;
    }
    console.log("sortQuery", sortQuery)
    return sortQuery;
}


VideoService.prototype.setHeadBanner = function (headBanner, callback) {
    headBanner.save(function (err, response) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, response);
        }
    });
}

VideoService.prototype.getVideoInfoByEntryIdUrl = function (videoEntryId, callback) {
    domain.Video.findOne({
        kalturaEntryId: videoEntryId
    }, function (err, video) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                videoId: video._id,
                channelId: video.channelId
            });
        }
    });
}

VideoService.prototype.getVideoDetail = function (videoId, user, callback) {
    async.parallel({
            videoDetail: function (next, results) {
                getVideoDetail(videoId, next);
            },
            revenueDetail: function (next) {
                getRevenueGeneratedByVideo(videoId, user, next);
            }
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results);
            }
        });
}

function getVideoDetail(videoId, callback) {
    domain.Video.findOne({
        _id: videoId,
        status: 'ready'
    }).populate([{
        path: "user_id"
    }]).exec(function (err, video) {
        if (err) {
            console.log(err);
            callback(err, null)
        } else {
            callback(null, video);
        }
    });
}

function getRevenueGeneratedByVideo(videoId, user, callback) {
    var mongoose = require('mongoose');
    var id = mongoose.Types.ObjectId(videoId);
    console.log("typeof videoId: ", user._id);
    domain.AdTransactionHistory.aggregate([{
            $match: {
                videoId: id
            }
        },
        {
            $group: {
                _id: null,
                channelAdminRevenue: {
                    $sum: '$channelAdminRevenue'
                },
                siteAdminRevenue: {
                    $sum: '$siteAdminRevenue'
                },
                totalViews: {
                    $sum: 1
                }
            }
        }], function (err, data) {
        console.log("data", data);
        if (err) {
            callback(err, null);
        } else {
            if (data.length) {
                if (user.role == 'Role_Channel_Admin') {
                    callback(null, {
                        totalRevenue: data[0].channelAdminRevenue,
                        totalViews: data[0].totalViews
                    });
                } else {
                    callback(null, {
                        totalRevenue: data[0].siteAdminRevenue,
                        totalViews: data[0].totalViews
                    });
                }
            } else {
                callback(null, {
                    totalRevenue: 0,
                    totalViews: 0
                });
            }

        }
    });
}

module.exports = function (app) {
    return new VideoService(app);
};

function jsonConcat(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}
