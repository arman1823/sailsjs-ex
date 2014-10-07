module.exports = {
    index: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
        var __ = res.i18n;
        var viewData = {};
        Users.findOne({ id: req.session.user }).populate("data").exec(function(userErr, userRes) {
            if ( userErr ) {
                console.log(userErr);
                if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
            }
            viewData.username = userRes.username;
            viewData.email = userRes.data[0].email;
            return res.view("feedback", viewData);
        });
    },
    feedbackPost: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
        var __ = res.i18n;
        var message = req.body.message;
        if ( ! message ) {
            return res.json({ status: false, message: __("feedback_no_message_error") });
        }
        Users.findOne({ id: req.session.user }).populate("data").exec(function(userErr, userRes) {
            if ( userErr ) {
                console.log(userErr);
                if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
            }
            var smtp_conf = require('../../config/smtp').smtp;
            var send_mail = require('../../lib/helpers').send_mail;
            send_mail({
                to: smtp_conf.feedback_email,
                subject: __('feedback_mail_subject'),
                text: __('feedback_mail_body')
                     .replace('{username}', userRes.username)
                     .replace('{email}', userRes.data.email)
                     .replace('{message}', message)
            }, function(err) {
                if ( err ) console.log(err);
                return res.json({ status: !err, message: __(err ? "feedback_submit_error" : "feedback_submit_success") });
            });
        });
    }
};