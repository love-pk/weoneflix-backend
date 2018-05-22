module.exports = function () {

    var informSiteAdmin = function (req, res, callback) {
        var content = req.body.contactUs;
        this.services.contactUsService.informSiteAdmin(content, callback);
    }

    return {
        informSiteAdmin: informSiteAdmin
    }
};
