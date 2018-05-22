var BaseService = require('./BaseService');
var softdelete = require('mongoose-softdelete');
var vedioService = require("./VideoService");
var readMultipleFiles = require('read-multiple-files');
var newclassinstance = new vedioService();
var mongoose = require('mongoose');

ChannelService = function(app) {
    this.app = app;
};

ChannelService.prototype = new BaseService();

ChannelService.prototype.getChannels = function(channelAdminId, skip, limit, callback) {
    domain.Channel.find({
        userId: channelAdminId
    }).skip(skip).limit(limit).exec(function(err, channel) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, channel);
        }
    });
}

ChannelService.prototype.createChannel = function(channelData, callback) {
    var channelObj = new domain.Channel({
        channelName: channelData.channelName,
        userId: channelData.userId,
        images: channelData.images
    });
    channelObj.save(function(err, response) {
        if (err) {
            callback(err, {
                "message": "Errror is  Channel Creation"
            });
            console.log("Errror is  Channel Creation")
        } else {
            callback(err, {
                "message": "Channel Successfully Created",
                "channel": response
            });
        }
    });

}

ChannelService.prototype.getVideos = function(skip, limit, channelId, callback) {
    var videoSkip = 0;
    if (skip != "" && skip != undefined && skip != null) {
        videoSkip = skip;
    }
    domain.Video.find({
        channelId: channelId
    }).populate("channelId").sort({
        views: -1
    }).skip(videoSkip).limit(limit).exec(
        function(err, videos) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, videos);
            }
        });
}

var findAllVideosInChannel = function(channelId, next) {
    domain.Video.find({
        channelId: channelId
    }, function(err, allvideos) {
        return next(err, allvideos);
    });
}

var deleteAllVideosInChannel = function(videoArray, next) {
    var count = 0;
    async.whilst(
        function() {
            return count < videoArray.length;
        },
        function(callback) {
            VideoService.prototype.deleteVideo(videoArray[count]._id, function(err, data) {
                if (err) {
                    callback(err, null);
                } else {
                    count++;
                    callback(null, count);
                }
            });
        },
        function(err, data) {
            if (err) {
                return next(err, null);
            } else {
                return next(null, data);
            }
        });
}

var findAllUserSubscribedThisChannel = function(channelId, next) {
    domain.User.find({
        channelSubscribed: channelId
    }, function(err, users) {
        return next(err, users);
    });
}

var unsubscribeAllUsers = function(userArray, channelId, next) {
    var unsubscribeChannelQuerry = {
        $pull: {
            channelSubscribed: channelId
        }
    };
    var count = 0;
    async.whilst(
        function() {
            return count < userArray.length;
        },
        function(callback) {
            domain.User.findOneAndUpdate({
                    _id: userArray[count]._id,
                    deleted: false
                },
                unsubscribeChannelQuerry,
                function(err, user) {
                    if (err) {
                        callback(err, null);
                    } else {
                        count++;
                        callback(null, count);
                    }
                });
        },
        function(err, data) {
            if (err) {
                return next(err, null);
            } else {
                return next(null, data);
            }
        });
}

var GetAndDeleteChannelImages = function(channelId, next) {
    domain.Channel.findOne({
        _id: channelId
    }, function(err, channel) {
        if (err) {
            next(err, null);
        } else if (channel == null || channel == undefined) {
            next(new Error("channel not found"), null);
        } else {
            var pathArray = [];
            var bannerPath = rootPath + "/public" + channel.images.banner;
            var thumbnailPath = rootPath + "/public" + channel.images.thumbnail;
            pathArray.push(bannerPath);
            pathArray.push(thumbnailPath);
            deleteImages(pathArray, next);
        }
    });
}

var deleteImages = function(pathArray, next) {
    var i = pathArray.length;
    pathArray.forEach(function(path) {
        fs.unlink(path, function(err) {
            i--;
            if (err) {
                return next(err, null);
            } else if (i <= 0) {
                console.log("Files deleted successfully!");
                return next(null, null);
            }
        });
    });
}

var deleteChannelfromDB = function(channelId, next) {
    domain.Channel.findOneAndRemove({
        _id: channelId
    }, function(err, channel) {
        return next(err, channel);
    });
}

/* This function helps to delete a channel
 * It perform the following:
 * delete all videos in channel.
 * unsubsribe all users.
 * delete channel images.
 * delete channel document from db.
 */
ChannelService.prototype.deleteChannel = function(channelId, callback) {

    async.auto({
            findAllVideosInChannel: function(next, results) {
                findAllVideosInChannel(channelId, next);
            },
            deleteAllVideosInChannel: ['findAllVideosInChannel', function(next, results) {
                var videoArray = results.findAllVideosInChannel;
                if (videoArray.length > 0) {
                    deleteAllVideosInChannel(videoArray, next);
                } else {
                    return next(null, null);
                }
            }],
            findAllUserSubscribedThisChannel: function(next, results) {
                findAllUserSubscribedThisChannel(channelId, next);
            },
            unsubscribeAllUsers: ['findAllUserSubscribedThisChannel', function(next, results) {
                var userArray = results.findAllUserSubscribedThisChannel;
                if (userArray.length > 0) {
                    unsubscribeAllUsers(userArray, channelId, next);
                } else {
                    return next(null, null);
                }
            }],
            GetAndDeleteChannelImages: ['unsubscribeAllUsers', 'findAllVideosInChannel', function(next, results) {
                GetAndDeleteChannelImages(channelId, next);
            }],
            deleteChannelfromDB: ['GetAndDeleteChannelImages', function(next, results) {
                deleteChannelfromDB(channelId, next);
            }]
        },
        function(err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.deleteChannelfromDB);
            }
        });
}


var findChannel = function(channelId, next) { //done
    domain.Channel.findOne({
        _id: channelId
    }).populate("userId").exec(function(err, channel) {
        return next(err, channel);
    });
}


var deleteChannelPreviousImages = function(files, channel, next) {
    var pathArray = [];
    var images = Object.keys(files);
    if (images.indexOf('banner') > -1) {
        var bannerPath = rootPath + "/public" + channel.images.banner;
        pathArray.push(bannerPath);
    }
    if (images.indexOf('thumbnail') > -1) {
        var thumbnailPath = rootPath + "/public" + channel.images.thumbnail;
        pathArray.push(thumbnailPath);
    }
    if (pathArray.length > 0) {
        deleteImages(pathArray, next);
    } else {
        next(null, null);
    }
}


var saveChannelNewImages = function(files, editedChannelData, next) {
    var allPaths = [];
    var allFiles = [];
    var channelData = editedChannelData;

    if (files.banner) {
        var bannerPath = files.banner.path;
        var bannerOriginalPath = rootPath + "/public/media/images/" + files.banner.name;
        channelData.images.banner = "/media/images/" + files.banner.name;
        allPaths.push(bannerPath);
        allFiles.push(bannerOriginalPath);

    }
    if (files.thumbnail) {
        var thumbnailPath = files.thumbnail.path;
        var logoOriginalPath = rootPath + "/public/media/images/" + files.thumbnail.name;
        channelData.images.thumbnail = "/media/images/" + files.thumbnail.name;
        allPaths.push(thumbnailPath);
        allFiles.push(logoOriginalPath);
    }
    if (allPaths.length > 0) {
        readMultipleFiles(allPaths, function(err, contents) {
            var count = 0;
            async.whilst(
                function() {
                    return count < contents.length;
                },
                function(callback) {
                    file = allFiles[count]
                    fs.writeFile(file, contents[count], function(err) {
                        if (err) {
                            callback(err, null);
                        } else {
                            count++;
                            file = "";
                            callback(null, count);
                        }
                    });
                },
                function(err, data) {
                    if (err) {
                        next(err, null);
                    } else {
                        next(null, channelData);
                    }
                });
        });
    } else {
        next(null, channelData);
    }
}
var updateChannelData = function(channelId, channelData, next) {
    domain.Channel.findOneAndUpdate({
        _id: channelId
    }, channelData, {
        new: true
    }, function(err, channel) {
        return next(err, channel);
    });
}

/* This function helps to update the channel * It perform the following: * find the channel through channel id. * delete previous  channel images. * save new channel images. * update  channel data. */
ChannelService.prototype.updateChannel = function(channelId, channelData, files, callback) {

    async.auto({
            findChannel: function(next, results) {
                findChannel(channelId, next);
            },
            deleteChannelPreviousImages: ['findChannel', function(next, results) {
                var channel = results.findChannel;
                if (channel) {
                    deleteChannelPreviousImages(files, channel, next);
                } else {
                    next(new Error('Invalid channel Id'), null);
                }
            }],
            saveChannelNewImages: ['deleteChannelPreviousImages', function(next, results) {
                var channel = results.findChannel;
                var editedChannelData = channelData;
                editedChannelData.images = channel.images;
                saveChannelNewImages(files, editedChannelData, next);
            }],
            updateChannelData: ['saveChannelNewImages', function(next, results) {
                var editedChannelData = results.saveChannelNewImages;
                if (editedChannelData) {
                    updateChannelData(channelId, editedChannelData, next);
                } else {
                    next(new Error('Some error occured'), null);
                }
            }]
        },
        function(err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.updateChannelData);
            }
        });
}



function getVideoCountByChannel(id, next) {
    console.log(typeof(id))
    console.log("id", (id))
    domain.Video.aggregate([{
            $match: {
                channelId: id
            }
        }, {
            $group: {
                _id: "$channelId",
                count: {
                    $sum: 1
                },
                completeViews: {
                    $sum: "$completeViews"
                }
            }
        }],
        function(err, info) {
            console.log('res:', info);
            if (info) {
                var map = {}
                if (info.length > 0) {
                    map.total = info[0].count;
                    map.completeViews = info[0].completeViews;
                    next(false, map);
                } else {
                    map.total = 0;
                    map.completeViews = 0;
                    next(false, map);
                }
            } else {
                next(err, null);
            }
        });
}
ChannelService.prototype.getAllSubscribersCountByChannel = function(channelId, next) {
    domain.User.aggregate([{
            $match: {
                channelSubscribed: channelId
            }
        }, {
            $group: {
                _id: "$channelSubscribed",
                UserInfo: {
                    $push: {
                        name: "$firstName",
                        email: "$email"
                    }
                },
                count: {
                    $sum: 1
                }
            }
        }],
        function(err, users) {
            if (users) {
                var map = {}
                if (users.length > 0) {
                    map.total = users[0].count;
                    map.userInfo = users[0].UserInfo;
                    next(false, map);
                } else {
                    map.total = 0;
                    map.userInfo = [];
                    next(false, map);
                }
            } else {
                next(err, null);
            }
        });
}
ChannelService.prototype.getTotalLength = function(callback) {
    domain.Channel.aggregate([{
        $group: {
            _id: null,
            count: {
                $sum: 1
            }
        }
    }], function(err, totalChannels) {
        if (err || totalChannels == null) {
            callback(err, null);
        } else {
            if (totalChannels == null)
                callback(false, 0);
            else {
                if (totalChannels.length == 0) {
                    callback(false, 0);
                } else {
                    callback(false, totalChannels[0].count);
                }

            }
        }
    });
}
ChannelService.prototype.getAdminChannels = function(skip, limit, type, callback) {
    var queryString = {};
    if (type == 'all') {
        queryString = {}
    }
    console.log(skip, limit, "call ")
    domain.Channel.find(queryString).skip(skip * limit).limit(limit).sort("-createdAt").populate({
        path: 'userId',
        select: 'email firstName lastName'
    }).exec(function(err, channels) {
        if (err)
            callback(true, err);
        else {
            async.parallel({
                    ChannelData: function(next, results) {
                        var count = 0;
                        var channelAggData = []
                        async.whilst(
                            function() {
                                return count < channels.length;
                            },
                            function(whilstCallback) {
                                var map = {}
                                map.channel = channels[count];
                                async.series({
                                        getVideoCountByChannel: function(next) {
                                            getVideoCountByChannel(channels[count]._id, next)
                                        },
                                        getAllSubscribersCountByChannel: function(next) {
                                            ChannelService.prototype.getAllSubscribersCountByChannel(channels[count]._id, next)
                                        },
                                    },
                                    function(err, results) {
                                        if (err) {
                                            console.log("Error in Search")
                                        } else {
                                            map.subscribers = results.getAllSubscribersCountByChannel
                                            map.videos = results.getVideoCountByChannel
                                            count++;
                                            channelAggData.push(map)
                                            whilstCallback(null);
                                        }
                                    });
                            },
                            function(err, n) {
                                if (err) {
                                    next(err, null);
                                } else {
                                    next(null, channelAggData);
                                }
                            });
                    },
                    ChannelCount: function(callback) {
                        ChannelService.prototype.getTotalLength(function(err, response) {
                            callback(null, response);
                        });
                    },
                },
                function(err, resultsOf) {
                    callback(err, resultsOf)
                });

        }

    });
}

ChannelService.prototype.getChannelDetail = function(channelId, callback) {
    async.parallel({
            findChannel: function(next, results) {
                findChannel(channelId, next);
            },
            getVideoCountByChannel: function(next) {
                var id = mongoose.Types.ObjectId(channelId);
                getVideoCountByChannel(id, next)
            },
            getAllSubscribersCountByChannel: function(next) {
                var id = mongoose.Types.ObjectId(channelId);
                ChannelService.prototype.getAllSubscribersCountByChannel(id, next)
            }
        },
        function(err, results) {
            if (err) {
                callback(err, null);
            } else {
                var map = {};
                map.subscribers = results.getAllSubscribersCountByChannel;
                map.videos = results.getVideoCountByChannel;
                map.channel = results.findChannel;
                callback(null, map);
            }
        });
}
var searchChannel = function(searchBy, value, next) {
    var query = {};
    if (searchBy == 'channelName') {
        query.channelName = {};
        query.channelName = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'channelId') {
        query._id = {};
        query._id = value.length > 12 ? mongoose.Types.ObjectId(value) : null;
    }
    console.log('channel search query', query);
    domain.Channel.find(query).limit(10).populate({
        path: 'userId',
        select: 'firstName email',
    }).exec(function(err, channel) {
        next(err, channel);
    });
}

var getTotolSubscribersOfChannel = function(channels, next) {
    var count = 0;
    async.whilst(
        function() {
            return count < channels.length;
        },
        function(callback) {
            ChannelService.prototype.getAllSubscribersCountByChannel(channels[count]._id, function(err, subscriber) {
                if (err) {
                    callback(err, null);
                } else {
                    channels[count]._doc.totalSubscriber = subscriber.total;
                    count++;
                    callback(null, null);
                }
            });
        },
        function(err, success) {
            if (err) {
                next(err, null);
            } else {
                next(null, channels);
            }
        });
}

ChannelService.prototype.searchChannel = function(searchBy, value, callback) {
    async.auto({
        searchChannel: function(next, results) {
            searchChannel(searchBy, value, next);
        },
        getTotalSubscriberOfChannel: ['searchChannel', function(next, results) {
            if (results.searchChannel && results.searchChannel.length) {
                var channels = results.searchChannel;
                getTotolSubscribersOfChannel(channels, next)
            } else {
                next(new Error('Channels not found'), null);
            }
        }]
    }, function(err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, results.getTotalSubscriberOfChannel);
        }
    });
}

module.exports = function(app) {
    return new ChannelService(app);

}
