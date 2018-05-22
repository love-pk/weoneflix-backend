module.exports = function () {

    var createAdView = function (req, res, callback) {
        var adViewObject = req.body;
        var viewerId = req.loggedInUser._id;
        var adEntryId = req.params.kalturaEntryId;
        this.services.adTransactionHistoryService.createAdView(viewerId, adEntryId, adViewObject, callback);
    }
    return {
        createAdView: createAdView
    }
};
