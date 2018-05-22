var BaseService = require('./BaseService');
var encrypt = require('../../../application-utilities/EncryptionUtility');
var emailUtility = require('../../../application-utilities/EmailUtility').emailUtility;

AdminService = function (app) {
    this.app = app;
};

AdminService.prototype = new BaseService();

var generateInvitationToken = function (next, results, inviteObj, res) {
    var invitationObj = new domain.InvitationToken({
        inviteToken: uuid.v1(),
        email: inviteObj.email,
        role: inviteObj.role
    });
    invitationObj.save(function (err, Obj) {
        if (err || Obj == null || Obj == undefined) {
            configurationHolder.ResponseUtil.responseHandler(res, err, configurationHolder.errorMessage.internalServerError, true, 500);
        } else {
            next(null, Obj);
        }
    })
}

var emailSendToUser = function (next, results) {
    var toEmail = results.generateInvitationToken.email;
    var inviteToken = results.generateInvitationToken.inviteToken;
    var subject = "You have got an Invitation";
    var inviteUrl = "http:" + configurationHolder.config.adminfrontendUrl + "/#/access/signup/" + inviteToken;
    var emailBody = "Hi," +
        "\n\n Please click the link below to create your account" +
        "\n\n" + inviteUrl +
        "\n\n\n Thank you";
    emailUtility.sendEmail(configurationHolder.config.emailFrom, toEmail, subject, emailBody);
    next(null, "email sent");
}

/* This helps to send invitation to a new Channel Admin
 * First, Generate Invitation token
 * send  Invitation token to Channel Admin through email.
 */
AdminService.prototype.inviteUser = function (res, inviteObj, callback) {
    async.auto({
            generateInvitationToken: function (next, results) {
                generateInvitationToken(next, results, inviteObj, res);
            },
            isEmailSend: ['generateInvitationToken', function (next, results) {
                emailSendToUser(next, results);
            }]
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else {
                var successMessage = {};
                successMessage.message = configurationHolder.appSuccessMessage.inviteSuccess;
                callback(null, successMessage);
            }
        });
}

var findUserThroughInvitationToken = function (next, results, inviteObj, res) {
    domain.InvitationToken.findOne({
        inviteToken: inviteObj.inviteToken
    }, function (err, invite) {
        if (err || invite == null || invite == undefined) {
            configurationHolder.ResponseUtil.responseHandler(res, err, configurationHolder.errorMessage.invalidToken, true, 500);
        } else {
            next(null, invite);
        }
    });
}

var createChannelAdmin = function (next, results, inviteObj, res) {
    var role = results.findUserThroughInvitationToken.role;
    var email = results.findUserThroughInvitationToken.email;
    domain.User.findOne({
        email: email,
        deleted: false
    }, function (err, user) {
        if (err) {
            next(err, null);
        } else if (user) {
            domain.User.findOneAndUpdate({
                email: email,
                deleted: false
            }, {
                role: role
            }, {
                new: true
            }, function (err, user) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, user);
                }
            });
        } else {
            var salt = uuid.v1();
            //create a new user
            var newUser = new domain.User(inviteObj.user);
            newUser.salt = salt;
            newUser.isAccountActive = true;
            newUser.isAccountLocked = false;
            newUser.email = email;
            newUser.password = encrypt(salt, inviteObj.user.password);
            newUser.role = role;
            newUser.save(function (err, userObj) {
                if (err || userObj == null || userObj == undefined) {
                    configurationHolder.ResponseUtil.responseHandler(res, err, configurationHolder.errorMessage.internalServerError, true, 500);
                } else {
                    next(null, userObj);
                }
            });
        }
    });
}

var generateAuthenticationToken = function (next, results, res) {
    var user = results.createChannelAdmin;
    var authenticationObj = new domain.AuthenticationToken({
        email: user.email,
        user: user._id,
        authToken: uuid.v1()
    });
    authenticationObj.save(function (err, authObj) {
        if (err || authObj == null || authObj == undefined) {
            configurationHolder.ResponseUtil.responseHandler(res, err, configurationHolder.errorMessage.internalServerError, true, 500);
        } else {
            var map = {};
            next(null, {
                "user": user,
                "authToken": authObj.authToken
            });
        }
    });
}

var deleteInvitationToken = function (next, results, inviteObj, res) {
    var isSuccess = false;
    domain.InvitationToken.remove({
        inviteToken: inviteObj.inviteToken
    }, function (err, user) {
        if (err || user == null || user == undefined) {
            configurationHolder.ResponseUtil.responseHandler(res, err, configurationHolder.errorMessage.invalidToken, true, 500);
        } else {
            isSuccess = true;
            next(null, isSuccess);
        }
    });
}

/* This helps to create a new Channel Admin
 * First, find Role through Invitation token
 * Create Channel Admin
 * Generate Authentication Token
 * Delete Invitation token .
 */
AdminService.prototype.createChannelAdmin = function (res, inviteObj, callback) {
    async.auto({
            findUserThroughInvitationToken: function (next, results) {
                findUserThroughInvitationToken(next, results, inviteObj, res);
            },
            createChannelAdmin: ['findUserThroughInvitationToken', function (next, results) {
                createChannelAdmin(next, results, inviteObj, res);
            }],
            generateAuthenticationToken: ['createChannelAdmin', function (next, results) {
                generateAuthenticationToken(next, results, res);
            }],
            deleteInvitationToken: ['generateAuthenticationToken', function (next, results) {
                deleteInvitationToken(next, results, inviteObj, res);
            }]
        },
        function (err, results) {
            if (err) {
                callback(err, null);
            } else if (results.deleteInvitationToken == true) {
                var authobj = results.generateAuthenticationToken;
                var successObj = {};
                successObj.user = authobj.user;
                successObj.authToken = authobj.authToken;
                successObj.message = configurationHolder.appSuccessMessage.channelAdminCreated;
                callback(null, successObj);
            }
        });
}

AdminService.prototype.getAdminDashboard = function (req, callback) {
    var query = req ? req.split(",") : [];
    async.parallel({
            users: function (callback) {
                _.contains(query, 'users') ? getAllAggUsers(function (err, users) {
                    if (!err) {
                        callback(null, users);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            },
            videos: function (callback) {
                _.contains(query, 'videos') ? getAllVideosCount(function (err, videos) {
                    if (!err) {
                        callback(null, videos);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            },
            advrts: function (callback) {
                _.contains(query, 'advertisement') ? getAllAdsCount(function (err, advrts) {
                    if (!err) {
                        callback(null, advrts);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            },
            channels: function (callback) {
                _.contains(query, 'channels') ? getAllChannelsCount(function (err, channels) {
                    if (!err) {
                        callback(null, channels);
                    } else {
                        callback(true, []);
                    }
                }) : callback(null, []);
            }

        },
        function (err, results) {
            if (err) {
                callback(true, err)
            } else {
                callback(null, results)
            }
        });

}

function getAllChannelsCount(callback) {
    domain.Channel.aggregate([{
            $group: {
                _id: null,
                count: {
                    $sum: 1
                }
            }
        }],
        function (err, count) {
            if (count) {
                if (count.length > 0) {
                    callback(null, count[0].count)
                } else {
                    count = 0
                    callback(null, count)
                }

            } else {
                callback(err, null)
            }
        });
}

function getAllVideosCount(callback) {
    domain.Video.aggregate([{
            $group: {
                _id: null,
                videos: {
                    $push: {
                        id: "$_id",
                        name: "$videoName",
                        views: "$completeViews",
                        images: "$images.thumbnail"
                    }
                },
                count: {
                    $sum: 1
                },
                completeViews: {
                    $sum: "$completeViews"
                }
            }
            }],
        function (err, info) {
            if (info) {
                var map = {}
                if (info.length > 0) {
                    map.total = info[0].count;
                    map.completeViews = info[0].completeViews;
                    info[0].videos = _.sortBy(info[0].videos, 'views', -1)
                    map.videos = info[0].videos.slice((_.size(info[0].videos) - 10), _.size(info[0].videos));
                    callback(null, map)
                } else {
                    map.total = 0;
                    map.completeViews = 0;
                    map.videos = []
                    callback(null, map)
                }
            } else {
                callback(err, null)
            }
        });
}

function getAllAdsCount(callback) {
    domain.Advertisement.aggregate([{
            $group: {
                _id: null,
                videos: {
                    $push: {
                        id: "$_id",
                        name: "$name",
                        views: "$completeViews",
                        images: "$thumbnail"
                    }
                },
                count: {
                    $sum: 1
                },
                completeViews: {
                    $sum: "$completeViews"
                }
            }
        }],
        function (err, info) {
            if (info) {
                var map = {}
                if (info.length > 0) {
                    var map = {}
                    map.total = info[0].count;
                    map.completeViews = info[0].completeViews;
                    info[0].videos = _.sortBy(info[0].videos, 'views', -1)
                    map.videos = info[0].videos.slice((_.size(info[0].videos) - 10), _.size(info[0].videos));
                    callback(null, map)
                } else {
                    map.total = 0;
                    map.completeViews = 0;
                    map.videos = []
                    callback(null, map)
                }
            } else {
                callback(err, null)
            }
        });
}

function getAllAggUsers(callback) {
    domain.User.aggregate([{
            $group: {
                _id: '$role',
                count: {
                    $sum: 1
                }
            }

        }],
        function (err, count) {
            if (count) {
                callback(null, count)
            } else {
                callback(err, null)
            }
        });
}
module.exports = function (app) {
    return new AdminService(app);
};
