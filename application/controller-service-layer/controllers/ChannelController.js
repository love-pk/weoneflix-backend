var done = false;

var fs = require('fs'),
    readMultipleFiles = require('read-multiple-files');

module.exports = function () {


    var getChannels = function (req, res, callback) {
        if (req.query.sender == "admin") {
            console.log("call from admin")
            var skip = req.query.skip;
            var limit = req.query.limit;
            var type = req.query.channel;
            this.services.channelService.getAdminChannels(skip, limit, type, callback);
        } else {
            var channelAdminId = req.loggedInUser._id;
            var skip = req.query.skip;
            var limit = req.query.limit;
            this.services.channelService.getChannels(channelAdminId, skip, limit, callback);
        }
    }


    var createChannel = function (req, res, callback) {

        var allPaths = [];
        var allFiles = [];
        var self = this;
        var bannerPath = req.files.banner.path;
        var thumbnailPath = req.files.thumbnail.path;
        allPaths.push(bannerPath);
        allPaths.push(thumbnailPath);
        var bannerOriginalPath = rootPath + "/public/media/images/" + req.files.banner.name;
        var logoOriginalPath = rootPath + "/public/media/images/" + req.files.thumbnail.name;
        allFiles.push(bannerOriginalPath);
        allFiles.push(logoOriginalPath);
        readMultipleFiles(allPaths, function (err, contents) {

            var count = 0;
            async.whilst(
                function () {
                    return count < contents.length;
                },
                function (callback) {
                    file = allFiles[count]
                    console.log("Loop");
                    fs.writeFile(file, contents[count], function (err) {

                    });
                    count++;
                    file = ""
                    callback(null, null)
                },
                function (err, n) {
                    if (!err) {
                        response = {
                            channelName: req.body.channelName,
                            userId: req.loggedInUser._id,
                            images: {
                                banner: "/media/images/" + req.files.banner.name,
                                thumbnail: "/media/images/" + req.files.thumbnail.name
                            }
                        };
                        self.services.channelService.createChannel(response, callback);
                    } else
                        console.log("Please check channel Controller")
                });
        });

    }


    var getVideos = function (req, res, callback) {
        var limit = req.query.limit != null ? req.query.limit : 0;
        var channelId = req.query.channelId;
        var skip = req.query.skip;
        this.services.channelService.getVideos(skip, limit, channelId, callback);
    }

    var deleteChannel = function (req, res, callback) {
        var channelId = req.params.id;
        this.services.channelService.deleteChannel(channelId, callback);
    }

    var updateChannel = function (req, res, callback) {
        var channelId = req.params.id;
        var channelData = req.body;
        var files = req.files;
        this.services.channelService.updateChannel(channelId, channelData, files, callback);
    }

    var getChannelDetail = function (req, res, callback) {
        var channelId = req.params.id;
        this.services.channelService.getChannelDetail(channelId, callback);
    }

    var searchChannel = function (req, res, callback) {
        var searchBy = req.query.searchBy;
        var value = req.query.value;
        this.services.channelService.searchChannel(searchBy, value, callback);
    }

    return {
        getChannels: getChannels,
        createChannel: createChannel,
        getVideos: getVideos,
        deleteChannel: deleteChannel,
        updateChannel: updateChannel,
        getChannelDetail: getChannelDetail,
        searchChannel: searchChannel

    }
};
