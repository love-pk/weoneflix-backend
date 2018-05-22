var kaltura = require('kaltura');
var async = require('async')
var videoService = require('./VideoService')
var advertisementService = require('./AdvertisementService')

var BaseService = require('./BaseService');
KalturaService = function (app) {
    this.app = app;
};

KalturaService.prototype = new BaseService();

var kalturaClient = null;
var Session = null;
var EXPIRATION_TIME = '10000000';
var projectId = "";


var initializeKaltura = function (callback) {
    var config = new kaltura.kc.KalturaConfiguration(configurationHolder.config.kalturaPartnerId);
    config.serviceUrl = configurationHolder.config.kalturaServerUrl;

    kalturaClient = new kaltura.kc.KalturaClient(config);
    kalturaClient.session.start(function (session) {
            kalturaClient.setKs(session);
            Session = session;
            callback();
        }, configurationHolder.config.kalturaAdminSecret, configurationHolder.config.kalturaUserId, kaltura.kc.enums.KalturaSessionType.ADMIN,
        parseInt(configurationHolder.config.kalturaPartnerId), EXPIRATION_TIME);
}



KalturaService.prototype.uploadVideoToKaltura = function (request) {

    var videoPath = request.filePath;
    var uploadManualToken = new kaltura.kc.objects.KalturaUploadToken();
    async.series({
            initializeKaltura: function (done) {
                initializeKaltura(function () {
                    done(null, null);
                });
            },
            uploadVideoToKaltura: function (done) {
                uploadMediaToKaltura(request, function (response) {
                    response.size = request.size;
                    response.filename = request.filename;
                    done(null, response);
                });
            },

        },
        function (err, results) {
            if (err) {
                Logger.error(err);
                throw err;
            } else {
                var qualityParams = "width/250/height/175/type/5/quality/100";
                var thumbnail = results.uploadVideoToKaltura.thumbnailUrl.substring(0, results.uploadVideoToKaltura.thumbnailUrl.indexOf('version')) + qualityParams
                if (request.contentType == "ads") { // Check if it is an Advertisement Or ot
                    var AdverID = request._id;
                    var thumbna
                    var adverObj = {
                        duration: results.uploadVideoToKaltura.duration,
                        kalturaEntryId: results.uploadVideoToKaltura.id,
                        thumbnail: thumbnail,
                        url: results.uploadVideoToKaltura.dataUrl
                    }
                    AdvertisementService.prototype.updateAdvertisement(AdverID, adverObj, function (err, data) {
                        if (err) {
                            console.log("Advertisement Kaltura Entry Id Updated Error ")
                        } else {
                            console.log("Advertisement Kaltura  Update Success")
                        }
                    });

                } else {
                    var videoId = request._id;
                    var videoObj = {
                        duration: results.uploadVideoToKaltura.duration,
                        kalturaEntryId: results.uploadVideoToKaltura.id,
                        'images.thumbnail': thumbnail
                    }
                    VideoService.prototype.updateVideo(videoId, videoObj, function (err, data) {
                        if (err) {
                            console.log("Video Kaltura Entry Id Updated Error ")
                        } else {
                            console.log("Video Kaltura Entry Id Updated Success")
                        }
                    });
                }
            }
        });

}

KalturaService.prototype.deleteVideo = function (kalturaEntryId, next) {
    async.series({
            initializeKaltura: function (done) {
                initializeKaltura(function () {
                    done(null, null);
                });
            },
            deleteVideoFromKaltura: function (done) {
                deleteVideoFromKaltura(kalturaEntryId, function (response) {
                    done(null, response);
                });
            }
        },
        function (err, results) {
            if (err) {
                next(null, err)
            } else {
                next(null, {
                    message: "video Deleted from Kaltura "
                })
            }
        });

}


var uploadMediaToKaltura = function (results, callback) {

    var uploadToken = new kaltura.kc.objects.KalturaAppToken();
    var videoPath = results.filePath;
    kalturaClient.uploadToken.add(function (token) {
            if (token && token.code && token.message) {
                consle.log('Kaltura Error', token);
            } else {
                kalturaClient.uploadToken.upload(function (token) {
                    var entry = new kaltura.kc.objects.KalturaMediaEntry();
                    entry.name = results.originalname;
                    entry.mediaType = kaltura.kc.enums.KalturaMediaType.VIDEO;
                    entry.sourceType = kaltura.kc.enums.KalturaSourceType.FILE;
                    kalturaClient.media.add(function (result) {
                        var resource = new kaltura.kc.objects.KalturaUploadedFileTokenResource();
                        resource.token = token.id;
                        kalturaClient.media.addContent(function (uploadSuccess) {
                            callback(uploadSuccess);
                        }, result.id, resource);
                    }, entry);
                }, token.id, videoPath);
            }
        },
        uploadToken);
}
var deleteVideoFromKaltura = function (kalturaEntryId, callback) {
    kalturaClient.media.deleteAction(function (deleteSuccess) {
            callback(deleteSuccess)
        },
        kalturaEntryId);
}

module.exports = function (app) {
    return new KalturaService(app);
};
