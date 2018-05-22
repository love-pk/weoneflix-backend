var BaseService = require('./BaseService');
var moment = require('moment');

CsvGeneratorService = function (app) {
    this.app = app;
};

CsvGeneratorService.prototype = new BaseService();

function getAdViewHistory(queryString, callback) {
    domain.AdTransactionHistory.find(queryString).populate([{
        path: 'videoId',
        select: "videoName",
        }, {
        path: 'channelId',
        select: "channelName",
        }, {
        path: 'adId',
        select: "name"
        }, {
        path: 'viewerId',
        select: "firstName lastName email"
        }]).exec(function (err, adHistory) {
        console.log('ad history', adHistory);
        if (adHistory) {
            callback(null, adHistory);
        } else {
            callback(err, null);
        }
    });
}

function createCSV(adHistory, callback) {
    //console.log("adHistory:", adHistory);
    var json2csv = require('json2csv');
    var fs = require('fs');
    var fields = ['adId._id', 'adId.name', 'videoId.videoName', 'channelId.channelName', 'formatedDate', 'viewerId.firstName', 'completed'];
    var fieldNames = ['Advertisment Id', 'Advertisement Name', 'Video Name', 'Channel Name', 'Viewed On', 'Viewer Name', 'Completed'];
    var data = adHistory;
    var repotArray = [];
    for (var index in data) {
        data[index].formatedDate = moment(data[index].createdAt, moment.ISO_8601, true).format('DD-MMM-YYYY');
    }
    console.log('formatedData', data);
    var csv = json2csv({
        data: data,
        fields: fields,
        fieldNames: fieldNames
    });
    var fileName = generateFileName();
    var filePath = 'public/downloads/' + fileName + '.csv';
    var downloadUrl = '/downloads/' + fileName + '.csv';
    fs.writeFile(filePath, csv, function (err) {
        if (err) {
            console.log('error while saving: ', err);
            callback(err, null);
        } else {
            console.log('file saved');
            callback(null, {
                filePath: downloadUrl
            });
        }
    });
}

function generateFileName() {
    var length = 32;
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

CsvGeneratorService.prototype.generateCSV = function (req, callback) {
    console.log("req data:", req);
    var queryString = {
        adId: req.adId,
        createdAt: {
            $gte: req.startDate,
            $lt: req.endDate
        }
    };
    getAdViewHistory(queryString, function (err, data) {
        if (err) {
            console.log('error:', err);
        } else {
            createCSV(data, callback);
        }
    })
};

module.exports = function (app) {
    return new CsvGeneratorService(app);
};
