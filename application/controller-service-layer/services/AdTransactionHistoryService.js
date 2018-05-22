var BaseService = require('./BaseService');
var RevenueMarginService = require('./RevenueMarginAndTransection/RevenueMarginService.js');
AdTransactionHistory = function (app) {
    this.app = app;
};

AdTransactionHistory.prototype = new BaseService();


var findAdvertisement = function (next, adEntryId) {
    domain.Advertisement.findOne({
        kalturaEntryId: adEntryId
    }, function (err, ad) {
        if (err || !ad) {
            next(new Error("Ad Not Found"), null);
        } else {
            next(null, ad);
        }
    });
}

var findChannelAdminId = function (next, channelId) {
    domain.Channel.findOne({
        _id: channelId
    }, function (err, channel) {
        if (err || !channel) {
            next(new Error("channel Id Not Found"), null);
        } else {
            next(null, channel.userId);
        }
    });
}
var saveAdTransactionHistory = function (next, adViewObject) {
    var adViewHistory = new domain.AdTransactionHistory(adViewObject);
    adViewHistory.save(function (err, obj) {
        if (err) {
            next(err, null);
        } else {
            next(null, obj);
        }
    });
}

var updateAdTransactionHistory = function (next, adToken, revenueObject) {
    domain.AdTransactionHistory.findOneAndUpdate({
        "adToken": adToken
    }, revenueObject, {
        new: true
    }, function (err, ad) {
        next(err, ad);
    });
}

var advertisementStartedTasks = function (viewerId, adEntryId, adViewObject, callback) {
    async.auto({
        findAdvertisement: function (next) {
            findAdvertisement(next, adEntryId);
        },
        findChannelAdminId: function (next) {
            findChannelAdminId(next, adViewObject.channelId);
        },
        saveAdTransactionHistory: ['findAdvertisement', 'findChannelAdminId', function (next, results) {
            var adId = results.findAdvertisement._id;
            var channelAdminId = results.findChannelAdminId;
            if (adId && channelAdminId) {
                adViewObject.adId = adId;
                adViewObject.viewerId = viewerId;
                adViewObject.channelAdminId = channelAdminId;
                saveAdTransactionHistory(next, adViewObject);
            } else {
                next(new Error("Ad Id or channel Admin Id not found"), null);
            }
            }]
    }, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                message: "Ad transaction successfully saved"
            });
        }
    });
}

var advertisementCompletedTasks = function (viewerId, adEntryId, adViewObject, callback) {
    async.auto({
        findAdvertisement: function (next) {
            findAdvertisement(next, adEntryId);
        },
        getRevenueMargin: function (next, results) {
            RevenueMarginService.getRevenuemargin(function (err, response) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, response);
                }
            });
        },
        updateAdTransactionHistory: ['getRevenueMargin', 'findAdvertisement', function (next, results) {
            var revenue = results.getRevenueMargin;
            var price = results.findAdvertisement.viewPrice;
            if (revenue && price) {
                var margin = revenue.adminMargin;
                var siteAdminAmt = (margin * price) / 100;
                var channelAdminAmt = ((100 - margin) * price) / 100;
                adViewObject.channelAdminRevenue = channelAdminAmt;
                adViewObject.siteAdminRevenue = siteAdminAmt;
                updateAdTransactionHistory(next, adViewObject.adToken, adViewObject);
            } else {
                next(new Error("Revenue margin or view price not found"), null);
            }
        }]
    }, function (err, results) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                message: "Ad transaction successfully saved"
            });
        }
    });
}

AdTransactionHistory.prototype.createAdView = function (viewerId, adEntryId, adViewObject, callback) {
    if (adViewObject.started) {
        advertisementStartedTasks(viewerId, adEntryId, adViewObject, callback);
    } else {
        advertisementCompletedTasks(viewerId, adEntryId, adViewObject, callback);
    }
}
module.exports = function (app) {
    return new AdTransactionHistory(app);
};
