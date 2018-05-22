var BaseService = require('./BaseService');
var encrypt = require('../../../application-utilities/EncryptionUtility');
var emailUtility = require('../../../application-utilities/EmailUtility').emailUtility;


UserService = function (app) {
    this.app = app;
};

UserService.prototype = new BaseService();

UserService.prototype.getUser = function (id, user, sender, callback) {
    var user = user.toObject();
    if (sender == 'user') {
        if (user.fbUserToken && user.password) {
            user.hasPassword = true;
        } else if (user.fbUserToken && !user.password) {
            user.hasPassword = false;
        } else {
            user.hasPassword = true;
        }
        return callback(null, user);
    } else if (sender == "admin") {
        domain.User.findOne({
            _id: id
        }, function (err, user) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, user);
            }
        });
    }
}

UserService.prototype.updateUser = function (id, dataObj, callback) {
    domain.User.findOneAndUpdate({
        _id: id,
        deleted: false
    }, dataObj, {
        new: true
    }, function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, user);
        }
    });
}

UserService.prototype.channelSubscribe = function (user, channelID, isSubscribe, res, callback) {
    var id = user._id;
    var message = {};
    var channelSubscribed = user.channelSubscribed;
    if (channelSubscribed.indexOf(channelID) > -1 && isSubscribe) {
        message.isSubscribed = true;
        callback(null, message);
    } else {
        var subscribeOrUnscribeChannel = {};

        if (isSubscribe) {
            subscribeOrUnscribeChannel = {
                $push: {
                    channelSubscribed: channelID
                }
            };
            //message.message = configurationHolder.appSuccessMessage.subscribedChannel;
            message.isSubscribed = true;

        } else {
            subscribeOrUnscribeChannel = {
                $pull: {
                    channelSubscribed: channelID
                }
            };
            //message.message = configurationHolder.appSuccessMessage.unsubscribedChannel;
            message.isSubscribed = false;
        }

        domain.User.findOneAndUpdate({
            _id: id,
            deleted: false
        }, subscribeOrUnscribeChannel, function (err, userobj) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, message);
            }
        });
    }
}

UserService.prototype.isChannelSubscribed = function (user, channelId, callback) {
    var object = {};
    var subscribedChannel = user.channelSubscribed;
    if (subscribedChannel.indexOf(channelId) > -1) {
        object.isSubscribed = true;
    } else {
        object.isSubscribed = false;
    }
    callback(null, object);
}

UserService.prototype.searchUser = function (searchBy, value, callback) {
    var query = {};
    if (searchBy == 'firstName') {
        query.firstName = {};
        query.firstName = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'lastName') {
        query.lastName = {};
        query.lastName = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'email') {
        query.email = {};
        query.email = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'userId') {
        query._id = {};
        query._id = value.length > 12 ? mongoose.Types.ObjectId(value) : null;
    }

    console.log('user search query', query);
    domain.User.find(query).limit(10).exec(function (err, user) {
        callback(err, user);
    });
}

UserService.prototype.deleteUser = function (id, callback) {
    domain.User.findOne({
        _id: id
    }, function (err, user) {
        if (err) {
            callback(err, user);
        }
        user.softdelete(function (err, deletedUser) {
            callback(err, deletedUser);
        });
    });
}

/* This method allow user to login or signup through facebook.
 * If user not exists ,Create a new user
 * generate authenticationo token and redirect the user to frontend.
 */
UserService.prototype.fbLogin = function (req, res, callback) {
    var fbAccessToken = req.user.accessToken;
    var userdata = req.user;
    console.log('userdata',userdata);
    if (!userdata._json.email) {
        return callback(new Error("Email not found. Please enter it."), null);
    }
    domain.User.findOne({
        'email': userdata._json.email
    }, function (err, user) {
        if (err) {
            callback(err, null);
        }
        if (user) {
            var token = uuid.v1();
            var authobj = {
                "authToken": token,
                "email": user.email,
                "user": user._id
            };
            saveAuthenticationToken(authobj, function (authdata) {
                res.redirect(configurationHolder.config.frontendUrl + "fb/" + authobj.authToken);
                res.end();
            });

        } else {
            // Create a new User
            var newUser = new domain.User();
            newUser.firstName = userdata._json.first_name;
            newUser.lastName = userdata._json.last_name;
            newUser.email = userdata._json.email;
            if (userdata._json.birthday) {
                newUser.DOB = userdata._json.birthday;
            } else {
                newUser.DOB = "";
            }
            newUser.isAccountActive = true;
            newUser.isAccountLocked = false;
            newUser.fbUserToken = fbAccessToken;
            newUser.role = "Role_User";
            newUser.save(function (err, user) {
                if (err) {
                    throw err;
                } else {
                    var token = uuid.v1();
                    var authobj = {
                        "authToken": token,
                        "email": userdata._json.email,
                        "user": user._id
                    };
                    saveAuthenticationToken(authobj, function (authdata) {
                        if (!userdata._json.birthday) {
                            res.redirect(configurationHolder.config.frontendUrl + "missing-field-alert/" + user._id);
                            res.end();
                        } else {
                            res.redirect(configurationHolder.config.frontendUrl + "fb/" + authobj.authToken);
                            res.end();
                        }
                    });
                }
            });
        }
    });
}

function saveAuthenticationToken(authobj, callback) {
    var authtoken = new domain.AuthenticationToken(authobj);
    authtoken.save(function (err) {
        if (err) {
            throw err;
        } else {
            var authdata = {};
            authdata.message = configurationHolder.appSuccessMessage.successfullyLogin;;
            authdata.token = authobj.authToken;
            callback(authdata);
        }
    });
}

/* Validate authentication token
 * find token in database
 * If token exists, user is logged in
 * else user logged out
 */
UserService.prototype.tokenValidate = function (token, callback) {
    var map = {};
    domain.AuthenticationToken.findOne({
        authToken: token
    }, function (err, userdata) {
        if (err) {
            map.isLoggedIn = false;
            callback(err, null);
        } else if (userdata) {
            map.isLoggedIn = true;
            domain.User.findOne({
                _id: userdata.user
            }, function (err, userInfo) {
                if (userInfo) {
                    map.userData = userInfo;
                    callback(err, map);
                } else {
                    callback(err, null);
                }
            })
        }
    });
}

var findUserThroughRegistrationToken = function (next, results, token) {
    domain.RegistrationToken.findOne({
        registrationToken: token
    }, function (err, user) {
        if (user) {
            next(null, {
                "_id": user._doc.user
            });
        } else {
            next(err, null);
        }
    });
}

var updateisAccountActiveToTrue = function (next, results, userdata) {
    domain.User.findOneAndUpdate({
        _id: userdata._id,
        deleted: false
    }, {
        isAccountActive: true
    }, function (error, userobj) {
        next(error, userobj);
    });
}

var removeRegistrationToken = function (next, results, token) {
    domain.RegistrationToken.remove({
        registrationToken: token
    }, function (err, user) {
        if (user) {
            next(null, user);
        } else {
            next(err, null);
        }
    });
}

/*
 * This function is used to verify email.
 * find the user through registration token
 * if token is valid , activate the user account
 * delete the registration token
 */
UserService.prototype.verifyEmail = function (token, callback) {

    async.auto({
            findUserThroughRegistrationToken: function (next, results) {
                findUserThroughRegistrationToken(next, results, token);
            },
            updateisAccountActiveToTrue: ['findUserThroughRegistrationToken', function (next, results) {
                var userdata = results.findUserThroughRegistrationToken;
                if (userdata) {
                    updateisAccountActiveToTrue(next, results, userdata);
                } else {
                    callback(new Error(configurationHolder.errorMessage.internalServerError), null);
                }
            }],
            removeRegistrationToken: ['updateisAccountActiveToTrue', function (next, results) {
                removeRegistrationToken(next, results, token);
            }]
        },
        function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, result.updateisAccountActiveToTrue);
            }

        });
}

var findUserThroughEmail = function (next, results, email) {
    domain.User.findOne({
            email: email,
            deleted: false
        },
        function (err, user) {
            if (user) {
                next(null, user);
            } else {
                next(err, null);
            }
        });
}

var saveForgetPasswordToken = function (next, results, forgetPasswordToken) {
    forgetPasswordToken.save(function (error, obj) {
        if (obj) {
            next(null, obj);
        } else {
            next(error, null);
        }
    });
}

var sendEmailToUser = function (next, task, results, userdata) {
    var forgetPasswordToken = results.saveForgetPasswordToken.forgetPasswordToken;
    var toEmail = userdata.email;
    var subject = "Change Password";
    if (task == "Admin-Forgot-Password") {
        var forgetPasswordUrl = "http:" + configurationHolder.config.adminfrontendUrl + "access/reset-password/" + forgetPasswordToken;
    } else {
        var forgetPasswordUrl = "http:" + configurationHolder.config.frontendUrl + "change-password/" + forgetPasswordToken;
    }
    var emailBody = "Hi " + userdata.firstName + "," +
        "\n\n Please click the link below to change your password" +
        "\n\n " + forgetPasswordUrl +
        "\n\n\n Thank you";
    emailUtility.sendEmail(configurationHolder.config.emailFrom, toEmail, subject, emailBody);
    next(null, userdata);
}

/*
 * This function is used to initiate change password process.
 * finds the user through email.
 * If user exists, generate forget Password token
 * send it to user through email.
 */
UserService.prototype.forgotPassword = function (email, task, callback) {
    async.auto({
        findUserThroughEmail: function (next, results) {
            findUserThroughEmail(next, results, email);
        },
        saveForgetPasswordToken: ['findUserThroughEmail', function (next, results) {
            var userdata = results.findUserThroughEmail;
            if (userdata) {
                var token = uuid.v1();
                var obj = {
                    "forgetPasswordToken": token,
                    "email": userdata.email,
                    "user": userdata._id
                };
                var forgetPasswordToken = new domain.RegistrationToken(obj);
                saveForgetPasswordToken(next, results, forgetPasswordToken);
            } else {
                next(new Error(configurationHolder.errorMessage.internalServerError), null);
            }
            }],
        sendEmailToUser: ['saveForgetPasswordToken', function (next, results) {
            var userdata = results.findUserThroughEmail;
            if (userdata) {
                sendEmailToUser(next, task, results, userdata);
            } else {
                next(new Error(configurationHolder.errorMessage.internalServerError), null);
            }
    }]
    }, function (err, result) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result.sendEmailToUser);
        }
    });
}

var findUserThroughToken = function (next, results, token) {
    domain.RegistrationToken.findOne({
        forgetPasswordToken: token
    }, function (err, user) {
        if (user) {
            next(null, {
                "_id": user._doc.user
            });
        } else {
            next(err, null);
        }
    });
}

var changeUserPassword = function (next, newPassword, id) {
    domain.User.findOne({
        _id: id,
        deleted: false
    }, function (error, userobj) {
        if (userobj.salt != '') {
            domain.User.findOneAndUpdate({
                _id: id
            }, {
                password: encrypt(userobj.salt, newPassword)
            }, null, function (error, userobj) {
                next(null, {
                    "message": "password changed"
                });
            });
        } else if (userobj.salt == '') {
            var salt = uuid.v1();
            userobj.salt = salt;
            userobj.password = encrypt(userobj.salt, newPassword);
            domain.User.findOneAndUpdate({
                _id: id
            }, {
                salt: userobj.salt,
                password: userobj.password
            }, {
                new: true
            }, function (error, userobj) {
                next(null, {
                    "message": "password changed"
                });
            });
        } else {
            next(error, null);
        }
    });
}

var removeForgetPasswordToken = function (next, results, token) {
    domain.RegistrationToken.remove({
        forgetPasswordToken: token
    }, function (err, regobj) {
        if (err) {
            next(err, null);
        } else {
            next(null, regobj);
        }
    });
}

//This function is used to change user password.

UserService.prototype.resetPassword = function (newPassword, sender, token, userid, user, callback) {
    if (sender == 'admin') {
        changeUserPassword(callback, newPassword, userid);
    } else if (sender == 'annonyous') {
        async.auto({
            findUserThroughToken: function (next, results) {
                findUserThroughToken(next, results, token);
            },
            changeUserPassword: ['findUserThroughToken', function (next, results) {
                var userdata = results.findUserThroughToken;
                if (userdata) {
                    changeUserPassword(next, newPassword, userdata._id);
                } else {
                    next(new Error(configurationHolder.errorMessage.internalServerError), null);
                }
            }],
            removeForgetPasswordToken: ['changeUserPassword', function (next, results) {
                removeForgetPasswordToken(next, results, token);
            }]
        }, function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, result.changeUserPassword);
            }
        });
    }
}

UserService.prototype.missingField = function (id, userObj, callback) {
    domain.User.findOneAndUpdate({
        _id: id,
        deleted: false
    }, userObj, {
        new: true
    }, function (err, user) {
        if (err) {
            callback(err, null);
        } else {
            domain.AuthenticationToken.findOne({
                email: user.email
            }, function (err, authobj) {
                callback(err, authobj);
            });
        }
    });
}

/* This method allow user to rate a video between 0 to 5
 * find the video rating through userid and videoid
 * If video rating exist, update it else create a new.
 */
UserService.prototype.createvideoRating = function (user, videoRating, callback) {
    var userid = user._id;
    videoRating.userid = userid;
    domain.VideoRating.findOneAndUpdate({
            userid: userid,
            videoID: videoRating.videoID
        }, videoRating, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        },
        function (err, obj) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, obj);
            }
        });
}

var verifyPassword = function (user, password) {
    var encryptedPassword = encrypt(user.salt, password);
    var passwordVerificationResult = (user.password == encryptedPassword) ? true : false;
    return passwordVerificationResult;
}

UserService.prototype.updateprofile = function (loggedInUser, userInfoToUpdate, callback) {
    var oldPassword = userInfoToUpdate.oldPassword;
    var newPassword = userInfoToUpdate.newPassword;
    if (verifyPassword(loggedInUser, oldPassword) || (loggedInUser.fbUserToken && !loggedInUser.password)) {
        changeUserPassword(callback, newPassword, loggedInUser._id);
    } else {
        callback(null, {
            "message": "Invalid password"
        });
    }
}

module.exports = function (app) {
    return new UserService(app);
};
