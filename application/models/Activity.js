 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var ActivitySchema = new mongooseSchema({
     name: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, 'Activity name is required']
     },
     value: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     description: {
         type: String,
         default: '',
         required: true
     },
    created: {
        type: Date,
        default: Date.now
    }
 });


 ActivitySchema.plugin(timestamps);
 ActivitySchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var Activity = mongoose.model('Activity', ActivitySchema);
 module.exports = Activity
