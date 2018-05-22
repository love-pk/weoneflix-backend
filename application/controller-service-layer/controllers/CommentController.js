module.exports = function () {
    var createComment = function (req, res, callback) {
        var self = this;
        var comments = new domain.Comment({
            description: req.body.commentInfo,
            videoID: req.body.videoId,
            userId: req.loggedInUser,
            postedOn: req.body.postedOn
        });
        console.log(comments.postedOn, "--", req.body.postedOn)
        comments.validate(function (err) {
            if (err != null || err == "undefined") {
                Logger.info(err.errors.stack);
                err.status = 400;
                callback(err, channel);
            } else {
                self.services.commentService.createComment(comments, callback);
            }
        })
    }
    var getComments = function (req, res, callback) {
        var self = this;
        var videoId = req.query.videoId;
        var skip = req.query.skip;
        var limit = req.query.limit;
        self.services.commentService.getComments(skip, limit, videoId, callback);
    }
    return {
        createComment: createComment,
        getComments: getComments
    }
};
