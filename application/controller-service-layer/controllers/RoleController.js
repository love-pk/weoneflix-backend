module.exports = function () {

    var createRole = function (req, res, callback) {
        var role = req.body.role;
        this.services.roleService.createRole(role, callback);
    }

    return {
        createRole: createRole

    }
};
