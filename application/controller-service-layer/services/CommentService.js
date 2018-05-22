var BaseService = require('./BaseService');
var softdelete = require('mongoose-softdelete');
CommentService = function (app) {
    this.app = app;
};
CommentService.prototype = new BaseService();
CommentService.prototype.createComment = function (comment, callback) {
    comment.save(function (err, commentObj) {
        callback(err, {
            "message": "Comment  Successfully Added",
            "comment": commentObj
        });
    });
}

CommentService.prototype.getComments = function (skip, limit, videoId, callback) {
    domain.Comment.find({
        videoID: videoId
    }).populate('userId', 'firstName lastName').sort('-createdAt').skip(skip).limit(limit).exec(function (err, commentsOfvideos) {
        if (err) {
            callback(true, err);
        } else {
            console.log(commentsOfvideos);
            callback(false, commentsOfvideos);
        }
    });
}
module.exports = function (app) {
    return new CommentService(app);
}
