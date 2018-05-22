 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var VideoRatingSchema = new mongooseSchema({
     videoID: {
         type: mongooseSchema.ObjectId,
         ref: 'Video',
         required: true,
         validate: [stringNotNull, 'VideoID is required']
     },
     userid: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true,
         validate: [stringNotNull, 'UserID is required']
     },
     rating: {
         type: Number,
         default: 0,
         max: 5,
         min: 0,
         required: true,
         validate: [stringNotNull, 'Video rating is required']
     },
     created: {
         type: Date,
         default: Date.now
     }
 });


 VideoRatingSchema.plugin(timestamps);
 VideoRatingSchema.plugin(softDelete);

 // VideoRatingSchema.pre('findOneAndUpdate', function (next) {
 //     this.options.runValidators = true;
 //     next();
 // });

 function stringNotNull(obj) {
     return obj.length;
 }

 var VideoRating = mongoose.model('videoRating', VideoRatingSchema);

 module.exports = VideoRating;
