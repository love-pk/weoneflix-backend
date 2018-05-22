var softDelete = require('mongoose-softdelete');
var timestamps = require('mongoose-timestamp');
var HeadBannerSchema = new mongooseSchema({
    videoID: {
        type: mongooseSchema.ObjectId,
        ref: 'Video'
    },
    category: {
        type: String,
        required: true
    },
    mainPage: {
        type: Boolean,
        required: true
    }
});
HeadBannerSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true;
    next();
});

HeadBannerSchema.plugin(timestamps);
HeadBannerSchema.plugin(softDelete);

var HeadBanner = mongoose.model('HeadBanner', HeadBannerSchema);
module.exports = HeadBanner;
