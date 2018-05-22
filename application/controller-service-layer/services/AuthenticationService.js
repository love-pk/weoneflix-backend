var BaseService = require('./BaseService');
var encrypt = require('../../../application-utilities/EncryptionUtility');

AuthenticationService = function (app) {
    this.app = app;
};

AuthenticationService.prototype = new BaseService();

var verifyPassword = function (user, password) {
    var encryptedPassword = encrypt(user.salt, password);
    var passwordVerificationResult = (user.password == encryptedPassword) ? true : false;
    return passwordVerificationResult;
}

var generateAuthenticationToken = function (user, email, callback) {
    var authenticationObj = new domain.AuthenticationToken({
        email: email,
        user: user._id,
        authToken: uuid.v1()
    });
    authenticationObj.save(function (err, authObj) {
        if (err) {
            callback(err, null);
        } else {
            var map = {};
            map.authToken = authObj.authToken;
            map.user = user;
            map.firstName = user.firstName;
            map.message = "Successfully logged in";
            callback(null, map);
        }
    })
}

/* verify whether the user exist in the system or not
 * find the user by emai
 * match the password
 * generate the authentiction token
 */
AuthenticationService.prototype.userLogin = function (email, password, callback) {
    domain.User.findOne({
        email: email,
        isAccountLocked: false
    }, function (err, user) {
        if (err) {
            callback(new Error("Invalid email or Password"), null);
        } else if (user && verifyPassword(user, password)) {
            if (user.isAccountActive == false) {
                callback(new Error("Verify your email."), null);
            } else {
                generateAuthenticationToken(user, email, callback);
            }
        } else {
            callback(new Error("Invalid Email or Password"), null);
        }
    })
}

/* This method allow user to log out.
 * Simply find the Authentication token and delete it.
 */
AuthenticationService.prototype.userLogout = function (token, callback) {
    var map = {};
    domain.AuthenticationToken.remove({
        authToken: token
    }, function (err, user) {
        if (user) {
            map.message = "Successfully logged out ";
        } else {
            map.message = "Invalid Token";
        }
        callback(err, map);
    });
}
module.exports = function (app) {
    return new AuthenticationService(app);
};
