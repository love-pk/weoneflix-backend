 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var RoleSchema = new mongooseSchema({
     name: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, 'Role name is required']
     },
     activities: [{
         type: String
     }],
     created: {
         type: Date,
         default: Date.now
     }
 });

 RoleSchema.plugin(timestamps);
 RoleSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length
 }
 var Role = mongoose.model('Role', RoleSchema);
 module.exports = Role
