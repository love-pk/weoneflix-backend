//var BaseService = require('../BaseService');
module.exports = (function() {
    var getAdminVideos = function(skip, limit, type, callback) {
        var queryString = {};
        var matchQuery = {};
        if (type == 'all') {
            queryString = {};
            matchQuery = {};
        } else {
            queryString = {
                videoType: {
                    $in: type
                }
            };
            matchQuery = {
                videoType: {
                    $in: [type]
                }
            };
        };
        async.parallel({
            videos: function(callback) {
                domain.Video.find(queryString).skip(skip * limit).limit(limit).sort("-createdAt").populate({
                    path: 'channelId',
                    select: 'channelName'
                }).exec(function(err, videos) {
                    if (videos) {
                        callback(null, videos)
                    } else {
                        callback(err, null)
                    }
                });
            },
            videosCount: function(callback) {
                domain.Video.aggregate([{
                    $match: matchQuery

                }, {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }], function(err, totalVideos) {
                    if (err) {
                        callback(err, null);
                    } else {
                        console.log(totalVideos)
                        if (totalVideos.length == 0) {
                            callback(false, 0);
                        } else {
                            callback(false, totalVideos[0].count);
                        }

                    }
                });
            }
        }, function(err, results) {
            callback(null, results)
        });


    }
    return {
        getAdminVideos: getAdminVideos
    }

})();
