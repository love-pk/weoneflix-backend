 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var PaymentSchema = new mongooseSchema({
     userId: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true
     },
     amount: {
         type: Number,
         required: true
     },
     type: {
         type: String,
         required: true
     },
     status: {
         type: String,
         default: 'pending'
     }
 });

 PaymentSchema.plugin(timestamps);
 PaymentSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var Payment = mongoose.model('Payment', PaymentSchema);
 module.exports = Payment
