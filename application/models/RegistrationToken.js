 var softDelete = require('mongoose-softdelete');
 var timestamps = require('mongoose-timestamp');

var RegistrationTokenSchema = new mongooseSchema({
    registrationToken: {
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
    user: {
        type: mongooseSchema.ObjectId,
        ref:'user'
    },
    forgetPasswordToken: {
        type: String,
        default: ''
    },
    created: {
        type: Date,
        default: Date.now
    }
});


function stringNotNull(obj){
    return obj.length
}

RegistrationTokenSchema.plugin(softDelete);
RegistrationTokenSchema.plugin(timestamps);

var RegistrationToken = mongoose.model('RegistrationToken', RegistrationTokenSchema);
module.exports = RegistrationToken
