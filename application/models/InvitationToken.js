 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

 var InvitationTokenSchema = new mongooseSchema({
     inviteToken: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     email: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, 'Email required']
     },
     role: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, 'Email required']
     }
 });


 function stringNotNull(obj) {
     return obj.length
 }

 InvitationTokenSchema.plugin(softDelete);
 InvitationTokenSchema.plugin(timestamps);

 var InvitationToken = mongoose.model('InvitationToken', InvitationTokenSchema);
 module.exports = InvitationToken
