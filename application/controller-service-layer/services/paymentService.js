var BaseService = require('./BaseService');

PaymentService = function (app) {
    this.app = app;
};

PaymentService.prototype = new BaseService();

PaymentService.prototype.channelAdminPayment = function (data, user, callback) {
    PaymentService.prototype.getRedeemAmount(user._id, user, function (err, success) {
        if (success && success.redeemAmount >= data.amount) {
            data.userId = user._id;
            var payment = new domain.Payment(data);
            payment.save(function (err, obj) {
                callback(err, obj);
            });
        } else {
            callback(new Error("Sorry Invalid Amount"), null);
        }
    });
}

var updatePaymentStatus = function (next, paymentId, status) {
    domain.Payment.findOneAndUpdate({
        _id: paymentId
    }, {
        status: status
    }, {
        new: true
    }, function (err, success) {
        next(err, success);
    });
}

PaymentService.prototype.updatePaymentStatus = function (status, userId, paymentId, callback) {
    async.auto({
            updatePaymentStatus: function (next, results) {
                updatePaymentStatus(next, paymentId, status);
            },
            updateChannelAdminAmount: ['updatePaymentStatus', function (next, results) {
                if (results.updatePaymentStatus && status == 'Approved') {
                    var totalRevenueRedeemed = results.updatePaymentStatus.amount;
                    var object = {
                        $inc: {
                            totalRevenueRedeemed: totalRevenueRedeemed
                        }
                    }
                    UserService.prototype.updateUser(userId, object, next);
                } else {
                    next(null, null);
                }
            }]
        },
        function (err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, {
                    message: 'Successfull payment'
                });
            }
        });
}

PaymentService.prototype.getPayments = function (skip, limit, callback) {
    domain.Payment.find({
        status: 'pending'
    }).populate({
        path: 'userId',
        select: "firstName"
    }).skip(skip * limit).limit(limit).exec(function (err, obj) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, obj);
        }
    });
}

PaymentService.prototype.getRedeemAmount = function (userId, user, callback) {
    domain.Payment.aggregate([{
                $match: {
                    userId: userId
                }
            },
            {
                $group: {
                    _id: '$userId',
                    amountRedeemed: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$status", "Approved"]
                                },
                                then: "$amount",
                                else: 0
                            }
                        }
                    },
                    amountInProcess: {
                        $sum: {
                            $cond: {
                                if: {
                                    $eq: ["$status", "pending"]
                                },
                                then: "$amount",
                                else: 0
                            }
                        }
                    }
                }
        }],
        function (err, data) {
            if (err) {
                callback(err, null);
            } else {
                var totalProfit = user.totalRevenueEarned ? user.totalRevenueEarned : 0;
                if (data.length) {
                    var amountRedeemed = data[0].amountRedeemed ? data[0].amountRedeemed : 0;
                    var amountInProcess = data[0].amountInProcess ? data[0].amountInProcess : 0;
                    var eligibleAmount = totalProfit - (amountRedeemed + amountInProcess);
                    callback(null, {
                        redeemAmount: eligibleAmount
                    });
                } else {
                    callback(null, {
                        redeemAmount: totalProfit
                    });
                }
            }
        });
}
module.exports = function (app) {
    return new PaymentService(app);
};
