module.exports = function () {

    var channelAdminPayment = function (req, res, callback) {
        var user = req.loggedInUser;
        var data = req.body.payment;
        this.services.paymentService.channelAdminPayment(data, user, callback);
    }

    var updatePaymentStatus = function (req, res, callback) {
        var userId = req.body.userId;
        var status = req.body.status;
        var paymentId = req.body.paymentId;
        this.services.paymentService.updatePaymentStatus(status, userId, paymentId, callback);
    }

    var getPayments = function (req, res, callback) {
        var skip = req.query.skip;
        var limit = req.query.limit;
        this.services.paymentService.getPayments(skip, limit, callback);
    }

    var getRedeemAmount = function (req, res, callback) {
        var userId = req.loggedInUser._id;
        var user = req.loggedInUser;
        this.services.paymentService.getRedeemAmount(userId, user, callback);
    }


    return {
        channelAdminPayment: channelAdminPayment,
        updatePaymentStatus: updatePaymentStatus,
        getPayments: getPayments,
        getRedeemAmount: getRedeemAmount
    }
};
