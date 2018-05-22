var BaseService = require('./BaseService');
var kalturaService = require("./KalturaService");
var videoService = require("./VideoService");
var RevenueMarginService = require('./RevenueMarginAndTransection/RevenueMarginService.js');
AdvertisementService = function(app) {
    this.app = app;
};

AdvertisementService.prototype = new BaseService();

function getCurrentViewPrice(next) {
    domain.RevenueMargin.findOne({}).exec(function(err, object) {
        if (err) {
            next(err, null);
        } else {
            next(null, object.viewPrice);
        }
    });
}

AdvertisementService.prototype.uploadAdvertisement = function(advertisement, callback) {
    async.auto({
            getCurrentViewPrice: function(next, results) {
                getCurrentViewPrice(next);
            },
            saveAdvertisement: ['getCurrentViewPrice', function(next, results) {
                var viewprice = results.getCurrentViewPrice;
                if (viewprice) {
                    advertisement.viewPrice = viewprice;
                    saveAllDetails(next, advertisement);
                } else {
                    next(new Error('Error in fetching view price'), null);
                }
            }]
        },
        function(err, result) {
            if (err) {
                callback(err, null);
            } else {
                callback(err, result.saveAdvertisement);
            }
        });
}

AdvertisementService.prototype.incrementViews = function(entryId, fieldToIncrement, callback) {
    var kalturaEntryId = entryId.trim();
    console.log('Ad-id:' + kalturaEntryId + " field:" + fieldToIncrement);
    var query = {};
    if (fieldToIncrement == 'views') {
        query = {
            $inc: {
                views: 1
            }
        }
    } else if (fieldToIncrement == 'completeViews') {
        query = {
            $inc: {
                completeViews: 1,
                remainingViews: -1
            }
        }
    }
    domain.Advertisement.findOneAndUpdate({
        kalturaEntryId: kalturaEntryId
    }, query, {
        new: true
    }, function(err, ad) {
        callback(err, ad);
    });
}

AdvertisementService.prototype.updateAdvertisement = function(id, AdvObject, loggedInUser, callback) {
    console.log(AdvObject, "to update the Add");
    domain.Advertisement.findOneAndUpdate({
            _id: id,
            deleted: false
        },
        AdvObject, {
            new: true
        },
        function(err, response) {
            if (err) {
                console.log(response, " update Ad error");
                callback(err, null);
            } else {
                callback(null, response);
                if (AdvObject.uploadStatus == 'approved') {
                    RevenueMarginService.setRevenuemargin(response, loggedInUser);
                }
            }
        });
}

AdvertisementService.prototype.getAdvertisements = function(id, skip, limit, callback) {
    domain.Advertisement.find({
        user_id: id,
        uploadStatus: {
            $in: ['ready', 'approved']
        }
    }).populate("user_id").skip(skip).limit(limit).exec(
        function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, response);
            }
        });
}
var deleteAdvertisementfromKaltura = function(id, next) {
    var self = this;
    domain.Advertisement.findOne({
        _id: id
    }, function(err, response) {
        if (err) {
            next(null, err);
        } else {
            KalturaService.prototype.deleteVideo(response.kalturaEntryId, function(err, data) {
                if (err) {
                    next(err, null);
                } else {
                    next(false, data);
                }
            });
        }
    });
}
var deleteAdvertisementfromDB = function(id, next) {
    domain.Advertisement.findOneAndRemove({
            _id: id
        },
        function(err, response) {
            next(err, response)
        });
}
AdvertisementService.prototype.deleteAdvertisement = function(id, callback) {
    async.auto({
            deleteAdvertisementfromKaltura: function(next) {
                deleteAdvertisementfromKaltura(id, next);
            },
            deleteAdvertisementfromDB: function(next) {
                deleteAdvertisementfromDB(id, next);
            }
        },
        function(err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.deleteVideofromDB);
            }
        });

}

var getVideoDetails = function(next, id) {
    domain.Video.findOne({
            _id: id,
            deleted: false
        },
        function(err, video) {
            if (err) {
                console.log("Errror is  videoService")
                next(err, null);
            } else {
                console.log(video.kalturaEntryId, "--------------")
                next(null, video);
            }
        });
}
var saveAllDetails = function(next, AdvObj) {
    var advertisement = new domain.Advertisement(AdvObj);
    advertisement.save(function(err, obj) {
        if (obj) {
            next(null, obj);
        } else {
            next(err, null);
        }
    });
}
AdvertisementService.prototype.saveAsAdvertisement = function(id, AdvObject, callback) {
    console.log(id, AdvObject)
    async.auto({
            getVideoDetails: function(next, results) {
                getVideoDetails(next, id);
            },
            saveAllDetails: ['getVideoDetails', function(next, results) {
                AdvObject.kalturaEntryId = results.getVideoDetails.kalturaEntryId,
                    AdvObject.size = results.getVideoDetails.size
                saveAllDetails(next, AdvObject);
            }]
        },
        function(err, results) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, results.AdvObject);
            }
        });
}

AdvertisementService.prototype.getAllAdsForAdmin = function(skip, limit, type, callback) {
    var queryString = {};
    var matchQuery = {};
    if (type == 'all') {
        queryString = {}
        matchQuery = {}
    } else {
        queryString = {
            adType: {
                $in: type
            }
        };
        matchQuery = {
            adType: {
                $in: [type]
            }
        };
    };

    async.series({
        adDetails: function(callback) {
            domain.Advertisement.find(queryString).skip(skip * limit).limit(limit).sort("-createdAt").populate({
                path: 'user_id',
                select: 'firstName lastName email'
            }).exec(function(err, ads) {
                if (ads) {
                    callback(null, ads)
                } else {
                    callback(err, null)
                }
            });
        },
        adCount: function(callback) {
            domain.Advertisement.aggregate([{
                $match: matchQuery
            }, {
                $group: {
                    _id: null,
                    count: {
                        $sum: 1
                    }
                }
            }], function(err, totalAds) {
                if (err) {
                    callback(err, null);
                } else {
                    if (totalAds.length == 0) {
                        callback(false, 0);
                    } else {
                        callback(false, totalAds[0].count);
                    }

                }
            });
        }
    }, function(err, results) {
        callback(null, results)
    });
}

AdvertisementService.prototype.getAdvertisementDetail = function(AdId, userRole, callback) {
    domain.Advertisement.findOne({
        _id: AdId
    }).populate("user_id").exec(
        function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                response._doc.userRole = userRole;
                console.log('ad detail', response);
                callback(null, response);
            }
        });
}

AdvertisementService.prototype.searchAdvertisement = function(searchBy, value, callback) {
    var query = {};
    if (searchBy == 'adName') {
        query.name = {};
        query.name = {
            '$regex': '(^' + value + '|' + value + ')',
            '$options': 'i'
        }
    } else if (searchBy == 'adId') {
        query._id = {};
        query._id = value.length > 12 ? mongoose.Types.ObjectId(value) : null;
    }
    console.log('advertisement search query', query);
    domain.Advertisement.find(query).limit(10).populate({
        path: 'user_id',
        select: 'email'
    }).exec(function(err, ad) {
        callback(err, ad);
    });
}
module.exports = function(app) {
    return new AdvertisementService(app);
};
