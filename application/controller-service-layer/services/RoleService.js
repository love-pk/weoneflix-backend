var BaseService = require('./BaseService');

RoleService = function (app) {
    this.app = app;
};

RoleService.prototype = new BaseService();

RoleService.prototype.createRole = function (role, callback) {
    var role = new domain.Role(role);
    role.save(function (err, obj) {
        if (obj) {
            callback(err, obj);
        } else {
            callback(err, null);
        }
    });
}

module.exports = function (app) {
    return new RoleService(app);
};
