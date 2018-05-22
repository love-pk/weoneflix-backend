 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var VideoSchema = new mongooseSchema({
     videoName: {
         type: String,
         trim: true,
         default: "New Video",
         validate: [stringNotNull, "video name is required"]
     },
     kalturaEntryId: {
         type: String,
         default: '',
         trim: true,
     },
     sourceName: {
         type: String,
         required: true,
         trim: true
     },
     images: {
         banner: String,
         thumbnail: String
     },
     s3Bucket: {
         type: String,
         default: '',
         trim: true
     },
     description: {
         type: String,
         default: '',
         trim: true
     },
     channelId: {
         type: mongooseSchema.ObjectId,
         ref: 'Channel',
         required: true
     },
     cast: [{
         name: {
             type: String,
             default: 'No Description available',
             trim: true
         },

         role: {
             type: String,
             default: 'No Description available',
             trim: true
         }

    }],
     releaseDate: {
         type: Date,
         default: Date.now
     },
     averageRating: {
         type: Number,
         max: 5,
         min: 0,
         default: 0
     },
     endDate: {
         type: Date,
         default: Date.now
     },
     //availableFlavours:[]
     views: {
         type: Number,
         default: 0
     },
     completeViews: {
         type: Number,
         default: 0
     },
     genre: [{
         type: String,
     }],
     status: {
         type: String,
         default: 'uploading',
         required: true,
         trim: true
     },
     duration: {
         type: Number,
     },
     size: {
         type: Number,
         required: true,
     },
     isAdvertisement: {
         type: Boolean,
         default: false,
     },
     videoType: {
         type: String,
         trim: true
     },
     user_id: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
     }
 });
 VideoSchema.pre('findOneAndUpdate', function (next) {
     this.options.runValidators = true;
     next();
 });
 VideoSchema.plugin(timestamps);
 VideoSchema.plugin(softDelete);

 //configuring different access level for the USER
 /*/UserSchema.plugin(require('mongoose-role'), {
   roles: configurationHolder.config.roles,
   accessLevels: configurationHolder.config.accessLevels
 });
 /*/
 function stringNotNull(obj) {
     return obj.length
 }
 var Video = mongoose.model('Video', VideoSchema);
 module.exports = Video
