 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var AdvertisementSchema = new mongooseSchema({
     commonId: {
         type: String,
         required: true
     },
     name: {
         type: String,
         required: true
     },
     description: {
         type: String,
         required: true
     },
     subscription: {
         type: String,
         required: true
     },
     views: {
         type: Number,
         default: 0
     },
     uploadStatus: {
         type: String,
         default: 'uploading'
     },
     completeViews: {
         type: Number,
         default: 0
     },
     viewsPurchased: {
         type: Number,
         required: true
     },
     duration: {
         type: Number,
     },
     kalturaEntryId: {
         type: String
     },
     user_id: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true
     },
     type: {
         type: String,
         default: 'Generic'
     },
     status: {
         type: String
     },
     duration: {
         type: Number
     },
     url: {
         type: String
     },
     thumbnail: {
         type: String
     },
     viewPrice: {
         type: Number,
         required: true
     },
     remainingViews: {
         type: Number,
         required: 0
     }

 });
 AdvertisementSchema.pre('findOneAndUpdate', function (next) {
     this.options.runValidators = true;
     next();
 });

 AdvertisementSchema.plugin(timestamps);
 AdvertisementSchema.plugin(softDelete);

 var Advertisement = mongoose.model('Advertisement', AdvertisementSchema);
 module.exports = Advertisement;
