var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
//var videoService = require("./VideoService");

module.exports = function () {
    var videoPath = configurationHolder.appConstants.VideoFilePathOfMulter;
    var imagePath = configurationHolder.appConstants.imageFilePathOfMulter;

    var uploadVideo = function (req, res, callback) {
        var self = this;
        var error = false;
        var file = videoPath + req.files.file.name;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile(file, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    response = {
                        message: 'File uploaded successfully',
                        filename: req.files.file.name,
                        originalname: req.files.file.originalname,
                        filePath: file,
                        size: req.files.file.size,
                        channelId: req.body.channelId

                    };
                    self.services.videoService.createVideo(response, function (err, res) {
                        if (err) {
                            console.log("error", err)
                            callback(true, err);
                        } else {
                            callback(false, res);
                            response._id = res._id;
                            self.services.kalturaService.uploadVideoToKaltura(response);
                        }
                    });
                }
            }); //write File
        }); // ReadFile
    }
    var uploadVideoBanner = function (req, res, callback) {
        var self = this;
        var error = false;
        var file = imagePath + req.files.file.name;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile(file, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    response = {
                        message: 'video Banner uploaded successfully',
                        filename: req.files.file.name,
                        filePath: '/media/images/' + req.files.file.name,
                        error: error
                    };
                    callback(false, response)
                }
            }); //write File
        }); // ReadFile
    }
    var updateVideoImages = function (req, res, callback) {
        var self = this;
        var error = false;
        var file = imagePath + req.files.file.name;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile(file, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    response = {
                        message: 'videoBanner updated successfully',
                        filename: req.files.file.name,
                        filePath: '/media/images/' + req.files.file.name,
                        error: error
                    };
                    callback(false, response)
                }
            }); //write File
        }); // ReadFile
    }
    return {
        uploadVideo: uploadVideo,
        uploadVideoBanner: uploadVideoBanner,
        updateVideoImages: updateVideoImages
    }
};


function getScreenShotsFromVideo(videoInformation, callback) {
    var filename = videoInformation.filename.split('.')[0];
    var command = ffmpeg(videoInformation.filePath).screenshots({
        count: 1,
        filename: filename,
        folder: rootPath + '/public/media/images',
        size: '180x?'
    }).on('end', function () {
        console.log("images gathered");
        var images = ['/media/images/' + filename + ".png"];
        response["images"] = images;
        callback(null, response);
    }).on('error', function (err) {
        console.log('An error occurred: ' + err.message);
    }).on('progress', function (progress) {
        console.log('Processing: ' + progress.percent + '% done');
    });
}
