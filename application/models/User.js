 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');
 var validator = require('validator'); //check email validation.

 var UserSchema = new mongooseSchema({
     firstName: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, "First name is required."]
     },
     lastName: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [stringNotNull, "Last name is required."]
     },
     email: {
         type: String,
         default: '',
         required: true,
         trim: true,
         validate: [validateEmail, 'Invalid Email']
     },
     password: {
         type: String,
         default: '',
         required: false
     },
     salt: {
         type: String,
         default: '',
         required: false,
         trim: true
     },
     fbUserToken: {
         type: String,
         default: '',
         required: false
     },
     isAccountLocked: {
         type: Boolean,
         default: false,
         required: true
     },
     isAccountActive: {
         type: Boolean,
         default: false,
         required: true
     },
     address: {
         city: String,
         state: String,
         country: String,
         pincode: String
     },
     role: {
         type: String,
         default: '',
         required: true,
         validate: [stringNotNull, "User Role is required."]
     },
     DOB: {
         type: Date, //YYYY-MM-DD
         required: false
     },
     Acc_info: {
         type: String,
         default: '',
         required: false
     },
     channelSubscribed: [{
         type: mongooseSchema.ObjectId,
         ref: 'Channel'
     }],
     totalRevenueEarned: {
         type: Number,
         default: 0
     },
     totalRevenueRedeemed: {
         type: Number,
         default: 0
     }

 });

 UserSchema.pre('findOneAndUpdate', function (next) {
     this.options.runValidators = true;
     next();
 });

 UserSchema.plugin(timestamps);
 UserSchema.plugin(softDelete);

 function stringNotNull(obj) {
     return obj.length;
 }

 function validateEmail(email) {
     return validator.isEmail(email);
 }

 var User = mongoose.model('user', UserSchema);

 User.schema.path('email').validate(function (value, respond) {
     User.findOne({
         email: value
     }, function (err, user) {
         if (user) {
             respond(false);
         } else {
             respond(true);
         }

     });
 }, 'This email address is already registered');

 module.exports = User;
