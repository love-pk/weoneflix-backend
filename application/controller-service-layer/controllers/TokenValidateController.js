var encrypt = require('../../../application-utilities/EncryptionUtility');
module.exports = function () {
var tokenValidate = function (req, res, callback) {
            var token=req.params.token;
            this.services.userService.tokenValidate(token,callback);

}
	return {
		tokenValidate:tokenValidate
}
}
