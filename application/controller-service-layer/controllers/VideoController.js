var encrypt = require('../../../application-utilities/EncryptionUtility');
var VideoAdminService = require('../services/VideosServices/VideoAdminService.js');
module.exports = function () {

    var createVideo = function (req, res, callback) {
        var self = this;
        var video = new domain.Video(req.body.data);
        video.validate(function (err) {
            if (err != null || err == "undefined") {
                Logger.info(err);
                err.status = 400;
                callback(err, video);
            } else {
                self.services.videoService.createVideo(video, callback);
            }
        })
    }
    var uploadVideo = function (req, res, callback) {
        var video = new domain.uploadAPI(req.body.video);
        this.services.videoService.uploadVideo(id, callback);
    }
    var getVideo = function (req, res, callback) {
        var id = req.params.id;
        this.services.videoService.getVideo(id, callback);
    }

    var searchVideo = function (req, res, callback) {
        var searchBy = req.query.searchBy;
        var value = req.query.value;
        this.services.videoService.searchVideo(searchBy, value, callback);
    }

    var updateVideo = function (req, res, callback) {
        var id = req.params.id;
        var videoData = req.body;
        videoData["user_id"] = req.loggedInUser._id
        this.services.videoService.updateVideo(id, videoData, callback);
    }
    var deleteVideo = function (req, res, callback) {
        var id = req.params.id;
        this.services.videoService.deleteVideo(id, callback);
    }

    var getVideoRating = function (req, res, callback) {
        var videoId = req.params.videoId;
        var user = req.loggedInUser;
        this.services.videoService.getVideoRating(user, videoId, callback);
    }

    var getVideos = function (req, res, callback) {
        if (req.query.sender == "admin") {
            console.log("call from admin")
            var skip = req.query.skip;
            var limit = req.query.limit;
            var type = req.query.videoType;
            VideoAdminService.getAdminVideos(skip, limit, type, callback);
        } else {
            console.log("call from front")
            var self = this;
            var type = req.query.type;
            var status = req.query.status;
            var user = req.loggedInUser;
            self.services.videoService.getVideos(type, status, user, callback);
        }

    }

    var getHeadBanner = function (req, res, callback) {
        var bannerDetails = req.params.bannerDetails;
        this.services.videoService.getHeadBanner(bannerDetails, callback);
    }

    var generateVastXML = function (req, res, callback) {
        var videoId = req.params.videoId;
        this.services.videoService.generateVastXML(videoId, res, callback);
    }

    var incrementVideoViews = function (req, res, callback) {
        var videoId = req.params.videoId;
        var incrementViews = req.query.incrementViews;
        this.services.videoService.incrementVideoViews(videoId, incrementViews, callback);
    }

    var setHeadBanner = function (req, res, callback) {
        var self = this;
        var headBanner = new domain.HeadBanner(req.body);
        headBanner.validate(function (err) {
            if (err != null || err == "undefined") {
                Logger.info(err);
                err.status = 400;
                callback(err, headBanner);
            } else {
                console.log(headBanner);
                self.services.videoService.setHeadBanner(headBanner, callback);
            }
        })
    }

    var getMoreVideos = function (req, res, callback) {
        var skip = req.query.skip;
        var limit = req.query.limit;
        var type = req.query.type;
        var category = req.query.category;
        var channelId = req.query.channelId;
        this.services.videoService.getMoreVideos(type, category, channelId, skip, limit, callback);

    }

    var getVideoDetail = function (req, res, callback) {
        var id = req.params.id;
        var user = req.loggedInUser;
        this.services.videoService.getVideoDetail(id, user, callback);
    }

    var videoInfoByEntryIdUrl = function (req, res, callback) {
        var videoEntryId = req.params.entryId;
        this.services.videoService.getVideoInfoByEntryIdUrl(videoEntryId, callback);
    }

    return {
        createVideo: createVideo,
        getVideo: getVideo,
        searchVideo: searchVideo,
        updateVideo: updateVideo,
        deleteVideo: deleteVideo,
        getVideoRating: getVideoRating,
        getVideos: getVideos,
        getHeadBanner: getHeadBanner,
        generateVastXML: generateVastXML,
        incrementVideoViews: incrementVideoViews,
        setHeadBanner: setHeadBanner,
        getMoreVideos: getMoreVideos,
        getVideoDetail: getVideoDetail,
        videoInfoByEntryIdUrl: videoInfoByEntryIdUrl
    }
};
