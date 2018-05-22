 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var AdTransactionHistorySchema = new mongooseSchema({
     viewerId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true,
         validate: [stringNotNull, 'Viewer ID is required']
     },
     channelId: {
         type: mongooseSchema.ObjectId,
         ref: 'Channel',
         required: true,
         validate: [stringNotNull, 'Channel ID is required']
     },
     videoId: {
         type: mongooseSchema.ObjectId,
         ref: 'Video',
         required: true,
         validate: [stringNotNull, 'Video ID is required']
     },
     adId: {
         type: mongooseSchema.ObjectId,
         ref: 'Advertisement',
         required: true,
         validate: [stringNotNull, 'Ad ID is required']
     },
     channelAdminId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true,
         validate: [stringNotNull, 'ChannelAdmin ID is required']
     },
     started: {
         type: Boolean,
         default: false
     },
     completed: {
         type: Boolean,
         default: false
     },
     adToken: {
         type: String,
         required: true,
         trim: true,
         validate: [stringNotNull, 'Ad token required']
     },
     channelAdminRevenue: {
         type: Number
     },
     siteAdminRevenue: {
         type: Number
     }
 });


 AdTransactionHistorySchema.plugin(timestamps);
 AdTransactionHistorySchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var AdTransactionHistory = mongoose.model('AdTransactionHistory', AdTransactionHistorySchema);
 module.exports = AdTransactionHistory
