var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var CommentSchema = new mongooseSchema({
    userId: {
        type: mongooseSchema.ObjectId,
        ref: 'user'
    },
    videoID: {
        type: mongooseSchema.ObjectId,
        ref: 'video'
    },
    postedOn: {
        type: Date,

    },
    description: {
        type: String,
    }

});
CommentSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

CommentSchema.plugin(timestamps);
CommentSchema.plugin(softDelete);

var Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
