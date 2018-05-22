module.exports = function () {
    var videoPath = configurationHolder.appConstants.VideoFilePathOfMulter;

    var uploadAdvertisement = function (req, res, callback) {
        var self = this;
        var error = false;
        var file = videoPath + +req.files.file.name;
        fs.readFile(req.files.file.path, function (err, data) {
            fs.writeFile(file, data, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    response = {
                        commonId: uuid.v1(),
                        name: req.files.file.name,
                        description: req.files.file.originalname,
                        subscription: 'default',
                        viewsPurchased: 0,
                        remainingViews: 0,
                        user_id: req.loggedInUser._id
                    };
                    self.services.advertisementService.uploadAdvertisement(response, function (err, res) {
                        if (err) {
                            callback(err, null);
                        } else {
                            res.name = req.files.file.originalname;
                            callback(null, res);
                            response._id = res._id;
                            response.filePath = file;
                            response.originalname = req.files.file.originalname;
                            response.contentType = "ads";
                            self.services.kalturaService.uploadVideoToKaltura(response);
                        }
                    });
                }
            }); //write File
        }); // ReadFile

    }

    var saveAsAdvertisement = function (req, res, callback) {
        var advertisementData = req.body;
        advertisementData.user_id = req.loggedInUser._id
        var id = req.params.videoId;
        this.services.advertisementService.saveAsAdvertisement(id, advertisementData, callback);
    }

    var incrementViews = function (req, res, callback) {
        var entryId = req.params.entryId;
        var fieldToIncrement = req.params.field;
        this.services.advertisementService.incrementViews(entryId, fieldToIncrement, callback);
    }
    var updateAdvertisement = function (req, res, callback) {
        var id = req.params.id;
        var loggedInUser = req.loggedInUser._id;
        var advertisementData = req.body;
        this.services.advertisementService.updateAdvertisement(id, advertisementData, loggedInUser, callback);
    }

    var getAdvertisements = function (req, res, callback) {
        if (req.query.sender == "admin") {
            var skip = req.query.skip;
            var limit = req.query.limit;
            var type = req.query.adType;
            this.services.advertisementService.getAllAdsForAdmin(skip, limit, type, callback);
        } else {
            var user_id = req.loggedInUser._id;
            var skip = req.query.skip;
            var limit = req.query.limit;
            this.services.advertisementService.getAdvertisements(user_id, skip, limit, callback);
        }
    }
    var deleteAdvertisement = function (req, res, callback) {
        var id = req.params.id;
        this.services.advertisementService.deleteAdvertisement(id, callback);
    }

    var searchAdvertisement = function (req, res, callback) {
        var searchBy = req.query.searchBy;
        var value = req.query.value;
        this.services.advertisementService.searchAdvertisement(searchBy, value, callback);
    }

    var getAdvertisementDetail = function (req, res, callback) {
        var adId = req.params.id;
        var userRole = req.loggedInUser.role;
        this.services.advertisementService.getAdvertisementDetail(adId, userRole, callback);
    }

    return {
        uploadAdvertisement: uploadAdvertisement,
        incrementViews: incrementViews,
        saveAsAdvertisement: saveAsAdvertisement,
        updateAdvertisement: updateAdvertisement,
        getAdvertisements: getAdvertisements,
        deleteAdvertisement: deleteAdvertisement,
        getAdvertisementDetail: getAdvertisementDetail,
        searchAdvertisement: searchAdvertisement


    }
};
