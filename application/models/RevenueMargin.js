 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var RevenueMarginSchema = new mongooseSchema({
     adminId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true
     },
     userId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: false
     },
     viewPrice: {
         type: Number,
         default: .50
     },
     adminMargin: {
         type: Number,
         default: 40
     }
 });


 RevenueMarginSchema.plugin(timestamps);
 RevenueMarginSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }

 var RevenueMargin = mongoose.model('RevenueMargin', RevenueMarginSchema);
 module.exports = RevenueMargin
