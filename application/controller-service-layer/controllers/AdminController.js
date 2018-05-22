module.exports = function () {

    var inviteUser = function (req, res, callback) {
        var inviteObj = req.body.invite;
        this.services.adminService.inviteUser(res, inviteObj, callback);
    }

    var createChannelAdmin = function (req, res, callback) {
        var inviteObj = req.body;
        this.services.adminService.createChannelAdmin(res, inviteObj, callback);
    }

    var getAdminDashboard = function (req, res, callback) {
        var data = req.query.data
        this.services.adminService.getAdminDashboard(data, callback);
    }
    return {
        inviteUser: inviteUser,
        createChannelAdmin: createChannelAdmin,
        getAdminDashboard: getAdminDashboard


    }
};
