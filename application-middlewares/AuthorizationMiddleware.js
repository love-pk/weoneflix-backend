/*
 * @author Abhimanyu
 * This module is for the authorization process . Called as middleware function to decide whether user have enough authority to access the
 *
 */
var async = require('async')
var userActivity;
module.exports.AuthorizationMiddleware = (function () {

    /*
     *  Verify user is authorized to access the functionality or not
     */
    var verifyIsActionInAccessLevel = function (next, results, res, req) {
        var authorized = false;
        var role = results.authorizationTokenObject.role;
        domain.Role.findOne({
            name: role
        }, function (err, roleObject) {
            if (!roleObject) {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.ActionfailedAuthorization, true, 401);
            } else {
                var roleActivities = roleObject.activities;
                if (roleActivities.indexOf(userActivity) > -1) {
                    authorized = true;
                    Logger.info("api for " + role);
                    req.loggedInUser = results.authorizationTokenObject.user;
                    next(null, authorized);
                } else {
                    configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401);
                }
            }
        });
    }
    var verifyIsActionInAccessLevelForAnyomous = function (res, req, NEXT) {
        var authorized = false;
        domain.Role.findOne({
            name: 'Role_Anonymous'
        }, function (err, roleObject) {
            if (!roleObject) {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.ActionfailedAuthorization, true, 401);
            } else {
                var roleActivities = roleObject.activities;
                if (roleActivities.indexOf(userActivity) > -1) {
                    authorized = true;
                    Logger.info("executed in accesslevel ");
                    Logger.info("api for anonymus user");
                    req.loggedInUser = null;
                    NEXT();
                } else {
                    configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401);
                }
            }
        });
    }

    /*
     * find User and its role using authenticationToken. 
     */
    var findRoleByAuthToken = function (next, results, req, res, authToken) {
        domain.AuthenticationToken.findOne({
            authToken: authToken
        }, function (err, authObj) {
            if (err || authObj == null) {
                configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401);
            } else {
                domain.User.findOne({
                    _id: authObj.user
                }, function (err, userData) {
                    if (userData) {
                        next(null, {
                            "user": userData,
                            "role": userData.role,
                            "userid": authObj.user
                        });
                    } else {
                        configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401);
                    }
                });
            }
        });
    }

    /*
     *  call as middleware to decide the accessiblity of the function for the loggedIn user
     *  find user by AuthenticationToken
     *  Decide based on the role of user and accesslevel whether user is authorized or not
     */
    var authority = function (activity) {
        return function (req, res, NEXT) {
            userActivity = activity.activity;
            var authToken = req.get("Auth-Token");
            if (authToken == null || authToken == "null" || authToken == undefined || authToken == "") {
                verifyIsActionInAccessLevelForAnyomous(res, req, NEXT);
            } else {
                async.auto({
                    authorizationTokenObject: function (next, results) {
                        findRoleByAuthToken(next, results, req, res, authToken);
                    },
                    isRoleInAccessLevel: ['authorizationTokenObject', function (next, results) {
                        verifyIsActionInAccessLevel(next, results, res, req);
                   }]
                }, function (err, results) {
                    if (results.isRoleInAccessLevel == true) {
                        NEXT();
                    } else {
                        configurationHolder.ResponseUtil.responseHandler(res, null, configurationHolder.errorMessage.failedAuthorization, true, 401);
                    }
                });
            }
        }
    }

    return {
        authority: authority
    };
})();
