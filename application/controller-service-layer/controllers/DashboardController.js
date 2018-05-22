var RevenueMarginService = require('../services/RevenueMarginAndTransection/RevenueMarginService.js');
module.exports = function () {

    var getChannelAdminDashboard = function (req, res, callback) {
        var id = req.loggedInUser._id;
        var dashboardSource = req.query.board;

        if (dashboardSource == 'revenue') {
            this.services.dashboardService.getChannelAdminRevenueDashboard(id, callback);
        } else {
            this.services.dashboardService.getChannelAdminDashboard(id, callback);
        }
    }

    var getAdvertisementAdminDashboard = function (req, res, callback) {
        var id = req.loggedInUser._id;
        this.services.dashboardService.getAdvertisementAdminDashboard(id, callback);
    }

    var getRevenueDashboard = function (req, res, callback) {
        var id = req.loggedInUser._id;
        this.services.dashboardService.getRevenueDashboard(id, callback);
    }
    var updateRevenueMargin = function (req, res, callback) {
        var id = req.loggedInUser._id;
        var newMargin = req.body.adminMargin;
        RevenueMarginService.updateRevenueMargin(id, newMargin, callback);
    }

    var getRevenuemargin = function (req, res, callback) {
        var id = req.loggedInUser._id;
        RevenueMarginService.getRevenuemargin(callback);
    }

    var updateViewPrice = function (req, res, callback) {
        var newViewPrice = req.body;
        var id = req.loggedInUser._id;
        RevenueMarginService.updateViewPrice(id, newViewPrice, callback);
    }

    var getViewPrice = function (req, res, callback) {
        var id = req.loggedInUser._id;
        RevenueMarginService.getViewPrice(id, callback);
    }
    return {
        getChannelAdminDashboard: getChannelAdminDashboard,
        getAdvertisementAdminDashboard: getAdvertisementAdminDashboard,
        getRevenueDashboard: getRevenueDashboard,
        updateRevenueMargin: updateRevenueMargin,
        getRevenuemargin: getRevenuemargin,
        getViewPrice: getViewPrice,
        updateViewPrice: updateViewPrice
    }
};
