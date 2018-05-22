var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

console.log("------",configurationHolder.config);



var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    auth: {
        user: 'noreply@woohooflix.com',
        pass: 'woohooflix@7'

    }
}));


module.exports.emailUtility = (function() {

    var sendEmail = function (fromEmail, toEmail, subject, emailBody) {
	console.log(fromEmail,toEmail,transport);
        transport.sendMail({
            from: fromEmail,
            to: toEmail,
            subject: subject,
            text: emailBody
        },function(err,success){
	console.log(err,"err",success,"success");
});

    }
    return {
        sendEmail : sendEmail
    }

}) ();
