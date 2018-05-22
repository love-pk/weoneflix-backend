var channelService = require("../../application/controller-service-layer/services/ChannelService");
var emailUtility = require('../EmailUtility').emailUtility;
module.exports = (function () {
    var mailTosubscribedUsers = function (videoId) {
        var count = 0;
        async.whilst(
            function () {
                return count < videoId.length;
            },
            function (whilstCallback) {
                console.log(videoId[count].channelId)
                async.auto({
                        getAllSubscribers: function (next, results) {
                            ChannelService.prototype.getAllSubscribersCountByChannel(videoId[count].channelId, next)
                        },
                        emailSendToUser: ['getAllSubscribers', function (next, results, callback) {
                            emailSendToUser(next, results)
                        }]
                    },
                    function (err, results) {
                        count++;
                        whilstCallback(null);
                    });
            },
            function (err, n) {
                if (err) {
                    console.log("Message Sent Error")
                } else {
                    console.log("Message Sent")
                }
            });
    }
    var emailSendToUser = function (next, results, callback) {
        var emailCount = 0;
        async.whilst(
            function () {
                return emailCount < results.getAllSubscribers.userInfo.length;
            },
            function (mailCallback) {
                console.log(results.getAllSubscribers.userInfo[emailCount].email)
                var toEmail = results.getAllSubscribers.userInfo[emailCount].email;
                var subject = "Woohoo We have a  new Video ";
                var emailBody = "Hi," + results.getAllSubscribers.userInfo[emailCount].name + "\n\n We have a new Video Uploaded in woohooflix Please check it for more fun" + "\n\n\n Thank you";
                emailUtility.sendEmail(configurationHolder.config.emailFrom, toEmail, subject, emailBody);
                emailCount++;
                console.log("mail Sent to ", toEmail, subject, configurationHolder.config.emailFrom)
                mailCallback(null)
            },
            function (err, n) {
                next(null, "email sent");
            }
        );
    }

    return {
        mailTosubscribedUsers: mailTosubscribedUsers
    }

})();
