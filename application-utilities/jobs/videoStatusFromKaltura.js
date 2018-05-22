var kalturaService = require("../../application/controller-service-layer/services/KalturaService");
var mailToSubscribers = require('./mailToSubscribers.js');

module.exports = function () {

    var kalturaClient = null;
    var Session = null;
    var EXPIRATION_TIME = '10000000';
    var projectId = "";
    var jobs = new CronJob({
        cronTime: '00 0-60/3 * * * *', //Sec,Min,H:Day of Month: 1-31 Months: 0-11 Day of Week: 0-6
        onTick: function () {
            VideoStatusJob();
            AdvertisementStatusJob();
        },
        start: false,
        timeZone: 'Asia/Kolkata'
    });

    jobs.start();

    var initializeKaltura = function (callback) {
        var config = new kaltura.kc.KalturaConfiguration(configurationHolder.config.kalturaPartnerId);
        config.serviceUrl = configurationHolder.config.kalturaServerUrl;

        kalturaClient = new kaltura.kc.KalturaClient(config);
        kalturaClient.session.start(function (session) {
                kalturaClient.setKs(session);
                Session = session;
                callback();
            }, configurationHolder.config.kalturaAdminSecret, configurationHolder.config.kalturaUserId, kaltura.kc.enums.KalturaSessionType.ADMIN,
            parseInt(configurationHolder.config.kalturaPartnerId), EXPIRATION_TIME);
    }

    var getkalturaEntryIdOfVideos = function (next) {
        domain.Video.aggregate([{
                $match: {
                    status: 'uploading'
                }
            },
            {
                $group: {
                    _id: null,
                    info: {
                        $push: {
                            kalturaEntryId: '$kalturaEntryId'
                        }
                    }
                }
            },
            {
                $project: {
                    kalturaEntryId: '$info.kalturaEntryId'
                }
            }], function (err, videos) {
            console.log('111111111111111  Job data', videos);
            if (err) {
                next(err, null);
            } else {
                next(null, videos);
            }
        });
    }

    var VideoStatusFromKaltura = function (next, entryIdArray) {
        console.log('22222222', entryIdArray.toString());
        var count = 0;
        var filter = new kaltura.kc.objects.KalturaMediaEntryFilter();
        var pager = new kaltura.kc.objects.KalturaFilterPager();
        filter.statusIn = "2";
        filter.idIn = entryIdArray.toString();
        kalturaClient.media.listAction(function (results) {
                if (results && results.code && results.message) {
                    console.log('Kaltura Error');
                } else {
                    next(null, results)
                }
            },
            filter, pager);
    }

    var updateVideoStatus = function (next, videos) {
        console.log('3333333333');
        var count = 0
        async.whilst(
            function () {
                return count < videos.length;
            },
            function (callback) {
                domain.Video.findOneAndUpdate({
                    kalturaEntryId: videos[count].id,
                }, {
                    'status': "ready",
                    'duration': videos[count].duration
                }, {
                    new: true
                }, function (err, success) {
                    if (err) {
                        callback(err, null)
                    } else {
                        count++;
                        callback(null, null);
                    }
                });
            },
            function (err, success) {
                if (err) {
                    next(err, null)
                } else {
                    next(null, {
                        message: "Success"
                    });
                }
            });

    }

    var createCuePoints = function (next, videos) {
        console.log('4444444444444');
        var count = 0;
        async.whilst(
            function () {
                return count < videos.length;
            },
            function (callback) {
                var duration = videos[count].msDuration; // Video duration
                var entryId = videos[count].id; // video kaltura entry id
                addCuePoints(entryId, duration, function (err, success) {
                    if (err) {
                        callback(err, null);
                    } else {
                        count++;
                        callback(null, null)
                    }
                });
            },
            function (err, success) {
                if (err) {
                    next(err, null);
                } else {
                    next(null, success);
                }
            });
    }

    var getCuePointsByEntryId = function (next, entryId) {
        domain.Video.findOne({
            kalturaEntryId: entryId
        }, function (err, video) {
            if (err) {
                next(err, null);
            } else {
                domain.CuePoints.findOne({
                    videoType: video.videoType
                }, function (err, obj) {
                    next(err, obj);
                });
            }
        }).select({
            videoType: 1
        });
    }

    var getCuePointsAsPerDuration = function (next, duration, allCuePoints) {
        var fiveMins = 5 * 60 * 1000;
        var tenMins = 10 * 60 * 1000;
        var twentyMins = 20 * 60 * 1000;
        var thirtyMins = 30 * 60 * 1000;
        var sixtyMins = 60 * 60 * 1000;
        var cuePoints = {};

        console.log('allCuePoints.lessThanFiveMins', allCuePoints.lessThanFiveMins)

        if (duration <= fiveMins) {
            cuePoints = allCuePoints.lessThanFiveMins;
        } else if (fiveMins < duration && duration <= tenMins) {
            cuePoints = allCuePoints.fiveToTenMins;
        } else if (tenMins < duration && duration <= twentyMins) {
            cuePoints = allCuePoints.tenToTwentyMins;
        } else if (twentyMins < duration && duration <= thirtyMins) {
            cuePoints = allCuePoints.thirtyToSixtyMins;
        } else if (thirtyMins < duration && duration <= sixtyMins) {
            cuePoints = allCuePoints.thirtyToSixtyMins;
        } else if (sixtyMins < duration) {
            cuePoints = allCuePoints.sixtyAndAboveMins;
        }

        makeCuePointsArray(cuePoints, duration, function (cuePointsArray) {
            console.log('Cue point Array', cuePointsArray)
            next(null, cuePointsArray);
        });
    }

    var makeCuePointsArray = function (cuePoints, duration, callback) {
        console.log("cuePoints: ", cuePoints);
        var arr = [];
        if (cuePoints.preRoll) {
            arr.push(1000);
        }
        if (cuePoints.postRoll) {
            arr.push(duration - 2000);
        }
        if (cuePoints.midRoll) {
            var midRollDuration = cuePoints.midRollValue * 60 * 1000;
            for (var i = midRollDuration; i < duration; i = i + midRollDuration) {
                arr.push(i);
            }
        }
        callback(arr);
    }

    var addCuePointsToVideo = function (next, cuePoints, entryId) {

        var cuePointObject = new kaltura.kc.objects.KalturaAdCuePoint();
        cuePointObject.protocolType = kaltura.kc.enums.KalturaAdProtocolType.VAST;
        cuePointObject.adType = kaltura.kc.enums.KalturaAdType.VIDEO;
        cuePointObject.entryId = entryId;

        var cuePointcount = 0;
        async.whilst(
            function () {
                return cuePointcount < cuePoints.length;
            },
            function (callback) {
                cuePointObject.triggeredAt = cuePoints[cuePointcount];
                cuePointObject.startTime = cuePoints[cuePointcount];
                cuePointObject.sourceUrl = "/api/v1/vastgenerator/" + entryId;
                cuePointObject.title = "myTestAdd_" + cuePoints[cuePointcount];
                kalturaClient.cuePoint.add(function (results) {
                    if (results && results.code && results.message) {
                        console.log('Kaltura Error');
                    } else {
                        cuePointcount++;
                        callback(null, null)
                    }
                }, cuePointObject);
            },
            function (err, res) {
                next(err, res)
            });
    }

    var addCuePoints = function (entryId, duration, next) {
        async.auto({
            getCuePointsByEntryId: function (cuePointCallback, results) {
                getCuePointsByEntryId(cuePointCallback, entryId);
            },
            getCuePoints: ['getCuePointsByEntryId', function (cuePointCallback, results) {
                var cuePoints = results.getCuePointsByEntryId;
                if (cuePoints) {
                    getCuePointsAsPerDuration(cuePointCallback, duration, cuePoints);
                } else {
                    next(new Error('unable to get the cue points'), null);
                }
            }],
            addCuePointsToVideo: ['getCuePoints', function (cuePointCallback, results) {
                if (results.getCuePoints.length) {
                    addCuePointsToVideo(cuePointCallback, results.getCuePoints, entryId);
                } else {
                    next(new Error('Unable to get cue points'), null);
                }
            }]
        }, function (err, result) {
            if (err) {
                next(err, null);
            } else {
                next(null, result);
            }

        });
    }

    var VideoStatusJob = function () {
        console.log('Job started');
        var videoID = [];
        async.auto({
            initializeKaltura: function (next) {
                initializeKaltura(function () {
                    next(null, null);
                });
            },
            getkalturaEntryIdOfVideos: ['initializeKaltura', function (next, results) {
                getkalturaEntryIdOfVideos(next);
        }],
            VideoStatusFromKaltura: ['getkalturaEntryIdOfVideos', function (next, results) {
                if (results.getkalturaEntryIdOfVideos.length) {
                    VideoStatusFromKaltura(next, results.getkalturaEntryIdOfVideos[0].kalturaEntryId);
                } else {
                    next(null, null);
                }
        }],
            updateVideoStatus: ['VideoStatusFromKaltura', function (next, results) {
                if (results.VideoStatusFromKaltura && results.VideoStatusFromKaltura.objects.length) {
                    updateVideoStatus(next, results.VideoStatusFromKaltura.objects);
                } else {
                    next(null, null);
                }
        }],
            createCuePoints: ['updateVideoStatus', function (next, results) {
                if (results.VideoStatusFromKaltura) {
                    createCuePoints(next, results.VideoStatusFromKaltura.objects);
                } else {
                    next(null, null);
                }
        }]
        }, function (err, res) {
            if (err) {
                console.log('Error: VideoStatusJob', err);
            } else {
                console.log('Video status successfully updated and cue point added', res);
                //mailToSubscribers.mailTosubscribedUsers(res.kalturaEntryId)
            }
        });
    };

    var AdvertisementStatusJob = function () {
        async.auto({
            initializeKaltura: function (done) {
                initializeKaltura(function () {
                    done(null, null);
                });
            },
            kalturaEntryId: ['initializeKaltura', function (next, results) {
                domain.Advertisement.find({
                    uploadStatus: 'uploading'
                }, function (err, kal) {
                    next(null, kal)
                }).select({
                    kalturaEntryId: 1,
                })
            }],
            aggregateKalturaId: ['kalturaEntryId', function (next, results) {
                if (results.kalturaEntryId.length != 0) {
                    var count = 0;
                    var kalturaIds = [];
                    async.whilst(
                        function () {
                            return count < results.kalturaEntryId.length;
                        },
                        function (callback) {
                            kalturaIds[count] = results.kalturaEntryId[count].kalturaEntryId
                            count++;
                            callback(null, kalturaIds)
                        },
                        function (err, ful) {
                            next(null, kalturaIds)
                        })
                } else {
                    next(null, null)
                }
        }],
            AdvertisementStatusFromKaltura: ['aggregateKalturaId', function (next, results) {
                if (results.aggregateKalturaId != null) {
                    var count = 0;
                    var filter = new kaltura.kc.objects.KalturaMediaEntryFilter();
                    var pager = new kaltura.kc.objects.KalturaFilterPager();
                    filter.statusIn = "2";
                    filter.idIn = results.aggregateKalturaId.toString();
                    kalturaClient.media.listAction(function (results) {
                            if (results && results.code && results.message) {
                                console.log('Kaltura Error');
                            } else {
                                next(null, results)
                            }
                        },
                        filter, pager);
                } else {
                    next(null, null)
                }
        }],
            updateAdvertisementStatus: ['AdvertisementStatusFromKaltura', function (next, results) {
                if (results.AdvertisementStatusFromKaltura == null) {
                    next(null, null)
                } else {
                    var count = 0
                    async.whilst(
                        function () {
                            return count < results.AdvertisementStatusFromKaltura.objects.length;
                        },
                        function (callback) {
                            domain.Advertisement.findOneAndUpdate({
                                    kalturaEntryId: results.AdvertisementStatusFromKaltura.objects[count].id,
                                }, {
                                    'uploadStatus': "ready",
                                    'url': results.AdvertisementStatusFromKaltura.objects[count].dataUrl,
                                    'duration': results.AdvertisementStatusFromKaltura.objects[count].duration
                                }, null,
                                function (err, success) {
                                    if (err) {
                                        console.log(err)
                                    } else {

                                    }
                                });
                            count++;
                            callback(null, count)
                        },
                        function (err, ful) {
                            next(null, null)
                        })
                }
        }],
            function (err, res) {
                console.log("Advertisement Status Updated")
            }
        });
    };
};
