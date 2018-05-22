module.exports = function () {


    var createUser = function (req, res, callback) {
        this.services.registrationService.registerUser(req.body.user, callback);
    }

    var getUser = function (req, res, callback) {
        var user = req.loggedInUser;
        var id = req.query.id;
        var sender = req.query.sender;
        this.services.userService.getUser(id, user, sender, callback);
    }

    var updateUser = function (req, res, callback) {
        var id = req.params.id;
        var user = req.body.user;
        this.services.userService.updateUser(id, user, callback);
    }

    var deleteUser = function (req, res, callback) {
        var id = req.params.id;
        this.services.userService.deleteUser(id, callback);
    }

    var searchUser = function (req, res, callback) {
        var searchBy = req.query.searchBy;
        var value = req.query.value;
        this.services.userService.searchUser(searchBy, value, callback);
    }

    var userLogin = function (req, res, callback) {
        var email = req.body.email;
        var password = req.body.password;
        this.services.authenticationService.userLogin(email, password, callback);
    }

    var userLogout = function (req, res, callback) {
        var token = req.params.token;
        this.services.authenticationService.userLogout(token, callback);
    }

    var fbLogin = function (req, res, callback) {
        this.services.userService.fbLogin(req, res, callback);
    }

    var verifyEmail = function (req, res, callback) {
        var token = req.params.token;
        this.services.userService.verifyEmail(token, callback);
    }

    var forgotPassword = function (req, res, callback) {
        var email = req.body.email;
        var task = req.body.task;
        this.services.userService.forgotPassword(email, task, callback);
    }

    var resetPassword = function (req, res, callback) {
        var newPassword = req.body.newPassword;
        var sender = req.query.sender;
        var token = req.query.token;
        var userid = req.query.userid;
        var user = req.loggedInUser;
        this.services.userService.resetPassword(newPassword, sender, token, userid, user, callback);
    }

    var missingField = function (req, res, callback) {
        var userdata = req.body.user;
        var id = req.params.id;
        this.services.userService.missingField(id, userdata, callback);
    }
    var channelSubscribe = function (req, res, callback) {
        var channelID = req.body.channelId;
        var isSubscribe = req.body.isSubscribe;
        var user = req.loggedInUser;
        this.services.userService.channelSubscribe(user, channelID, isSubscribe, res, callback);
    }

    var isChannelSubscribed = function (req, res, callback) {
        var user = req.loggedInUser;
        var channelId = req.params.channelId;
        this.services.userService.isChannelSubscribed(user, channelId, callback);
    }

    var createvideoRating = function (req, res, callback) {
        var videoRating = req.body.video;
        var user = req.loggedInUser;
        this.services.userService.createvideoRating(user, videoRating, callback);
    }

    var getAllUsers = function (req, res, callback) {
        var skip = req.query.skip;
        var limit = req.query.limit;
        var userType = req.query.userType;
        this.services.adminUserService.getAllUsers(skip, limit, userType, callback);
    }

    var updateprofile = function (req, res, callback) {
        var userInfoToUpdate = req.body;
        var loggedInUser = req.loggedInUser;
        this.services.userService.updateprofile(loggedInUser, userInfoToUpdate, callback);
    }
    return {
        createUser: createUser,
        getUser: getUser,
        updateUser: updateUser,
        searchUser: searchUser,
        deleteUser: deleteUser,
        userLogin: userLogin,
        userLogout: userLogout,
        fbLogin: fbLogin,
        verifyEmail: verifyEmail,
        forgotPassword: forgotPassword,
        resetPassword: resetPassword,
        missingField: missingField,
        channelSubscribe: channelSubscribe,
        isChannelSubscribed: isChannelSubscribed,
        createvideoRating: createvideoRating,
        getAllUsers: getAllUsers,
        updateprofile: updateprofile

    }
};
