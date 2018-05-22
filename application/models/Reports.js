 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var ReportSchema = new mongooseSchema({
     reportedBy: {
         type: mongooseSchema.ObjectId,
         ref: 'user',
         required: true,
         validate: [stringNotNull, 'User ID is required']
     },
     content: {
         type: String,
         default: '',
         required: true
     },
     reason: {
         type: String,
         default: '',
         required: true
     },
     content_id: {
         type: mongooseSchema.ObjectId,
         ref: 'Comment',
         required: true,
         validate: [stringNotNull, 'Content ID is required']
     },
     status: {
         type: String,
         default: '',
         required: true
     }
 });


 ReportSchema.plugin(timestamps);
 ReportSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var Report = mongoose.model('Report', ReportSchema);
 module.exports = Report
