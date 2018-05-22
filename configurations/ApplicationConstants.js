var dirname = __dirname;
var mediaPath = dirname.replace('/configurations', '');

var appConstants = {
    VideoFilePathOfMulter: mediaPath + "/public/media/videos/",
    imageFilePathOfMulter: mediaPath + "/public/media/images/"
}
module.exports.appConstants = appConstants
