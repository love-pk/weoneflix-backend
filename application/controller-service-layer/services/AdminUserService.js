var BaseService = require('./BaseService');
AdminUserService = function(app) {
    this.app = app;
};

AdminUserService.prototype = new BaseService();

AdminUserService.prototype.getAllUsers = function(skip, limit, userType, callback) {
    var queryString = {};
    var matchQuery = {};
    if (userType == 'all') {
        queryString = {
            role: {
                $ne: 'Role_Site_Admin'
            }
        };
        matchQuery = {
            role: {
                $ne: 'Role_Site_Admin'
            }
        };
    } else {
        queryString = {
            role: {
                $in: userType
            }
        };
        matchQuery = {
            role: {
                $in: [userType]
            }
        };
    };
    async.series({
        users: function(callback) {
            domain.User.find((queryString),
                function(err, results) {
                    if (err) {
                        callback(true, err)
                    } else {
                        callback(false, results)
                    }
                }).skip(skip * limit).limit(limit).select({
                'email': 1,
                _id: -1,
                firstName: 1,
                lastName: 1,
                role: 1,
                DOB: 1,
                createdAt: 1,
                isAccountActive: 1,
            });
        },
        userCount: function(callback) {
            domain.User.aggregate([{
                $match: matchQuery
            }, {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            }], function(err, totalUsers) {
                if (err || totalUsers == null) {
                    callback(err, null);
                } else {
                    if (totalUsers.length == 0) {
                        callback(false, 0);
                    } else {
                        callback(false, totalUsers[0].count);
                    }

                }
            });
        }
    }, function(err, results) {
        console.log(results)
        callback(null, results)
    });


}

module.exports = function(app) {
    return new AdminUserService(app);
};
