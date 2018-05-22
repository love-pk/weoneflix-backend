module.exports = (function () {

    var setRevenuemargin = function (req, loggedInUser) {
        var revenue = {};
        revenue.adminId = loggedInUser;
        revenue.adminMargin = 40;
        revenue.adId = req._id;
        var revenueMargin = new domain.RevenueMargin(revenue);
        domain.RevenueMargin.find({}, function (err, response) {
            if (response) {
                if (response.length == 0) {
                    revenueMargin.save(function (err, obj) {
                        if (obj) {
                            console.log("Created Margin")
                        } else {
                            console.log("Created Margin fail")
                        }
                    });
                }
            } else {
                console.log("Error", err)
            }
        });

    }

    var updateRevenueMargin = function (id, newMargin, callback) {
        domain.RevenueMargin.findOneAndUpdate({}, {
            adminMargin: newMargin
        }, {
            new: true
        }, function (err, obj) {
            if (obj) {
                callback(false, obj)
            } else {
                callback(true, err)
            }
        })
    }

    var getRevenuemargin = function (callback) {
        domain.RevenueMargin.findOne({}, function (err, response) {
            if (response) {
                callback(null, response)
            } else {
                callback(err, null)
            }
        });
    }

    var updateViewPrice = function (id, newViewPrice, callback) {
        domain.RevenueMargin.findOneAndUpdate({
            adminId: id
        }, newViewPrice, {
            new: true
        }, function (err, obj) {
            if (obj) {
                callback(null, obj);
            } else {
                callback(err, null);
            }
        })
    }

    var getViewPrice = function (id, callback) {
        domain.RevenueMargin.findOne({}, function (err, response) {
            if (response) {
                callback(null, {
                    viewPrice: response.viewPrice
                });
            } else {
                callback(err, null);
            }
        });
    }
    return {
        setRevenuemargin: setRevenuemargin,
        getRevenuemargin: getRevenuemargin,
        updateRevenueMargin: updateRevenueMargin,
        updateViewPrice: updateViewPrice,
        getViewPrice: getViewPrice
    }

})();
