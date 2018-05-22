var BaseService = require('./BaseService');
var emailUtility = require('../../../application-utilities/EmailUtility').emailUtility;

ContactUsService = function (app) {
    this.app = app;
};

ContactUsService.prototype = new BaseService();

ContactUsService.prototype.informSiteAdmin = function (content, callback) {
    domain.User.findOne({
        role: "Role_Site_Admin"
    }, function (err, admin) {
        if (err) {
            callback(err, null);
        } else {
            sendEmailToSiteAdmin(admin.email, content);
            callback(null, {});
        }
    });
}

function sendEmailToSiteAdmin(adminEmail, content) {
    var toEmail = adminEmail;
    var subject = "WoohooFlix we have an enquiry";
    var emailBody = "An enquiry has been made on the website" + "\n\n" +
        "Name: " + content.name + "\n\n" +
        "Email: " + content.email + "\n\n" +
        "Query: " + content.query + "\n\n" +
        "Message: " + content.message + "\n\n";
    console.log("Email sent to site admin:", adminEmail);
    emailUtility.sendEmail(configurationHolder.config.emailFrom, toEmail, subject, emailBody);
}

module.exports = function (app) {
    return new ContactUsService(app);
};
