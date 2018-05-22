var BaseService = require('./BaseService');
var encrypt = require('../../../application-utilities/EncryptionUtility');
var emailUtility = require('../../../application-utilities/EmailUtility').emailUtility;


RegistrationService = function (app) {
    this.app = app;
};

RegistrationService.prototype = new BaseService();

var createUser = function (next, results, userObject, callback) {
    var salt = uuid.v1();
    //create a new user
    var newUser = new domain.User(userObject);
    newUser.salt = salt;
    newUser.isAccountActive = false;
    newUser.isAccountLocked = false;
    newUser.password = encrypt(salt, userObject.password);
    //newUser.role = role;
    newUser.role = "Role_User";
    newUser.save(function (err, userObj) {
        if (err) {
            callback(err, null);
        } else {
            next(null, userObj);
        }
    });
}

var generateRegistrationToken = function (next, results, callback) {
    var registrationObj = new domain.RegistrationToken({
        email: results.saveUser.email,
        user: results.saveUser._id,
        registrationToken: uuid.v1()
    })
    registrationObj.save(function (err, registrationObj) {
        if (err) {
            callback(err, null);
        } else {
            next(null, registrationObj);
        }
    })
}

var emailSendToUser = function (next, results, callback) {
    var toEmail = results.generateRegistrationToken.email;
    var registrationToken = results.generateRegistrationToken.registrationToken;
    var subject = "Please verify your email address";
    var verifyEmailUrl = "http:" + configurationHolder.config.frontendUrl + "verify-email/" + registrationToken;
    var emailBody = "Hi," +
        "\n\n Please click the link below to verify your account" +
        "\n\n" + verifyEmailUrl +
        "\n\n\n Thank you";
    emailUtility.sendEmail(configurationHolder.config.emailFrom, toEmail, subject, emailBody);
    next(null, "email sent");
}

/* This method is used to register a new user.
 * First, create a new user
 * Generate  registration token.
 * send  registration token to user through email. to verify email.
 */
RegistrationService.prototype.registerUser = function (userObject, callback) {
    async.auto({
        saveUser: function (next, results) {
            createUser(next, results, userObject, callback);
        },
        generateRegistrationToken: ['saveUser', function (next, results, callback) {
            generateRegistrationToken(next, results)
            }],
        isEmailSend: ['generateRegistrationToken', function (next, results, callback) {
            emailSendToUser(next, results);
            }]
    }, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            var successMessage = {};
            successMessage.message = "User Created Successfully";
            callback(null, successMessage);
            //callback(null, results.generateRegistrationToken);
        }

    });
}


module.exports = function (app) {
    return new RegistrationService(app);
};
