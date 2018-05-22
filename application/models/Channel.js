 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var ChannelSchema = new mongooseSchema({
     userId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true
     },
     images: {
         banner: String,
         thumbnail: String
     },
     channelName: {
         type: String,
         required: true,
         trim: true,
         validate: [stringNotNull, 'ChannelName is required']
     }
 });
 ChannelSchema.pre('findOneAndUpdate', function (next) {
     this.options.runValidators = true;
     next();
 });

 ChannelSchema.plugin(timestamps);
 ChannelSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length;
 }

 function validateEmail(email) {
     return validator.isEmail(email);
 }
 var Channel = mongoose.model('Channel', ChannelSchema);
 module.exports = Channel;
