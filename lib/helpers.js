var helpers = {}
	,smtp_conf = require('../config/smtp').smtp
	,nodemailer = require("nodemailer")
	,customValidator = require('../config/custom-validator').validator

helpers.uc = function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
};

helpers.send_mail = function(options, callback) {
	var smtpTransport = nodemailer.createTransport("SMTP",{
	    service: smtp_conf.service,
	    auth: {
	        user: smtp_conf.user,
	        pass: smtp_conf.pass
	    }
	});

	var mailOptions = {
	    from: smtp_conf.from,
	    to: options.to,
	    subject: options.subject,
	    text: options.text || '',
	    html: options.html || ''
	};

	smtpTransport.sendMail(mailOptions, function(error, response) {
	    smtpTransport.close();
	    callback(error, response)
	});	
};

helpers.validate = function(error) {
	var message = []
		,db_errors = { 'ER_DUP_ENTRY': 'unique'	};

	if(!error.ValidationError) {
		error.ValidationError = {};
		var key = error.toString().match(/key\s'(.*?)'/i);
		error.ValidationError[(key ? key[1] : 'unhandled')] = [{'rule': (err_code = db_errors[(error['code'] ? error['code'] : 'unhandled')] || 'unhandled'), 'message': error}];
	};

	for(err in error.ValidationError) {
		for (var i = 0; i < error.ValidationError[err].length; i++) {
			var rule = error.ValidationError[err][i]['rule'];
			message.push( customValidator[err] ?	customValidator[err][rule] || error.ValidationError[err][i]['message'] : error.ValidationError[err][i]['message'] );
		};
	};
	
	return(message.join(', ')); 
};

helpers.un = function(numbers) {
	numbers.sort(function (a,b) {
        return a - b;
    });
	var a = numbers[0]
		, b = numbers[1];
	return (0.5 * (a+b) * (a+b+1)+b); 
};

module.exports = helpers;
