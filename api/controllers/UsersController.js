module.exports = {
    index: function (req, res) {
        res.notFound();
    },

    login: function (req, res) {
        res.notFound();
    },

    "loginPost": function(req,res){
        if( req.session.user ) { return };
        var bcrypt = require('bcrypt-nodejs')
            , __ = res.i18n;
        Users.findOneByUsername(req.param('username'), function (err, user) {
            if (err) { return res.json({ status: false, message: __('user_find_error') }) };
            if (user) {
                var match = bcrypt.compareSync(req.param('password'), user.password);
                if (match && user.is_active && user.is_confirmed) {
                    req.session.user = user.id;
                    return res.json( { status: true });
                }
                else {
                    return res.json( { status: false, message: __( !user.is_confirmed ? 'user_not_confirmed' : ( user.is_active ? 'invalid_password' : 'user_deleted'))});
                }
            } else {
                return res.json( { status: false, message: __('user_not_found')});
            }
        });
    },

    logout: function (req, res) {
        req.session.destroy();
        res.redirect('/');
    },

    /*User Registration*/
    "sign-up": function (req, res) {
        if( req.session.user) { return res.redirect('/') };
        res.view('users/register');
    },

    "sign-upPost": function (req, res) {
        if( req.session.user) { return };
        var __ = res.i18n
            ,validate = require('../../lib/helpers').validate
            ,send_mail = require('../../lib/helpers').send_mail
            ,urlencode = require('urlencode');

        if( (req.body.user.password != req.body.user.passwordConfirm) || ! req.body.agree ) {
            return res.json({ status: false, message: __(req.body.agree ? 'passwords_dont_mutch' : 'terms_not_checked') } );
        }
        Users.create(req.body.user)
            .exec(function(userErr, user) {
                if(userErr) { res.json( { status: false, message: __(validate(userErr)) } ) }
                else {
                    req.body.userData.user = user.id;
                    UserData.create(req.body.userData)
                        .exec(function(dataErr, userData) {
                            if(dataErr) { Users.destroy({ id: user.id }).done(function(destroyErr) { res.json( { status: false, message: __(validate(destroyErr || dataErr)) } ) }) }
                            else {
                                send_mail({
                                    to: userData.email,
                                    subject: __('user_registration_mail_subject'),
                                    text: __('user_registration_mail_body')
                                        .replace('{full_name}', userData.full_name)
                                        .replace('{key}', urlencode(user.password))
                                },function(err, result) {
                                    res.json( { status: true } );
                                })
                            }
                        })
                }
            })
    },

    welcome: function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        res.view('statics/welcome');
    },
    /*END*/

    /*Activate Profile*/
    "activate-profile": function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        var key = req.param("key")
        __ = res.i18n
            ,urlencode = require('urlencode');

        if ( ! key ) return res.notFound();
        Users.update({
            password: urlencode.decode(req.param("key"))
        },{
            is_confirmed: 1
        }, function(err, users) {
            res.render('statics/activate_profile', { message : (err ? 'key_is_invalid' : 'user_confirmed') });
        });
    },

    // "resend-activation-email": function(req, res) {
    // 	if( req.session.user) { return res.redirect('/') };
    // 	res.render('users/resend_activation_email')
    // },
    // "resend-activation-emailPost": function(req, res) {
    // 	if( req.session.user) { return };
    // 	var username = req.body.username
    // 		, __ = res.i18n
    // 		,send_mail = require('../../lib/helpers').send_mail
    // 		,urlencode = require('urlencode');

    // 	Users.findOne({
    // 		username: username
    // 	}).populate("data").exec(function(err, user) {
    // 		user = user || {};
    // 		var userData = (user.data ? user.data[0] : {}) || {};
    // 		if (user.id && !user.is_confirmed) {
    // 			send_mail({
    // 				to: userData.email,
    // 				subject: __('user_registration_mail_subject'),
    // 				text: __('user_registration_mail_body')
    // 					.replace('{full_name}', userData.full_name)
    // 					.replace('{key}', urlencode(user.password))
    // 			},function(err, result) {
    // 				res.json( { status: true , message: __('activation_email_send')} );
    // 			})
    // 		}
    // 		else {
    // 			res.json({ status: false, message: __(username.length ? ( user.is_confirmed ? 'user_already_confirmed' : 'user_not_found') : "username_field_required") });
    // 		}
    // 	});
    // },
    /*END*/

    /*Forgot Password*/
    "forgot-password": function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        res.render('users/forgot_password');
    },
    "forgot-passwordPost": function(req, res) {
        if( req.session.user) { return };
        var email = req.body.email
            , __ = res.i18n
            ,send_mail = require('../../lib/helpers').send_mail
            ,urlencode = require('urlencode');
        UserData.findOne({
            email: email
        }).exec(function(err, userData) {
                userData = userData || {};
                if (userData.id) {
                    Users.findOne({
                        id: userData.user
                    }).exec(function(err, user) {
                            send_mail({
                                to: userData.email,
                                subject: __('forgot_password_mail_subject'),
                                text: __('forgot_password_mail_body')
                                    .replace('{full_name}', userData.full_name)
                                    .replace('{key}', urlencode(user.password))
                            },function(err, result) {
                                res.json({ status: !err, message: __(err ? 'forgot_password_email_error' : '') });
                            })
                        })
                }
                else {
                    res.json({ status: false, message: __(email.length ? 'email_not_found' : "email_field_required") });
                }
            });
    },
    "forgot-password-sent": function(req, res) {
        if( req.session.user ) { return res.redirect('/') };
        res.render('statics/forgot_password__sent')
    },
    /*END*/

    /*Forgot Username*/
    "forgot-username": function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        res.render('users/forgot_username');
    },
    "forgot-usernamePost": function(req, res) {
        if( req.session.user) { return };
        var email = req.body.email
            , __ = res.i18n
            ,send_mail = require('../../lib/helpers').send_mail;
        UserData.findOne({
            email: email
        }).exec(function(err, userData) {
                userData = userData || {};
                if (userData.id) {
                    Users.findOne({
                        id: userData.user
                    }).exec(function(err, user) {
                            send_mail({
                                to: userData.email,
                                subject: __('forgot_username_mail_subject'),
                                text: __('forgot_username_mail_body')
                                    .replace('{full_name}', userData.full_name)
                                    .replace('{username}', user.username)
                            },function(err, result) {
                                return res.json({ status: !err, message: __(err ? 'forgot_username_email_error' : '') });
                            })
                        })
                }
                else {
                    return res.json({ status: false, message: __(email.length ? 'email_not_found' : "email_field_required") });
                }
            });
    },
    "forgot-username-sent": function(req, res) {
        if( req.session.user ) { return res.redirect('/') };
        res.render('users/forgot_username__sent')
    },
    /*END*/

    /*Recovery Password*/
    "recovery-password": function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        var key = req.param("key");
        if ( ! key ) return res.notFound();
        res.render('users/recovery_password', {key: key});
    },
    "recovery-passwordPost": function(req, res) {
        if( req.session.user) { return  };
        var username = req.body.username
            ,key = req.body.key
            ,password = req.body.password
            ,confirm_password = req.body.confirm_password
            ,__ = res.i18n
            ,validate = require('../../lib/helpers').validate
            ,urlencode = require('urlencode');

        function do_and_response(user, password, response_message) {
            var status = false;
            if(arguments.length == 1) {
                response_message = user;
                return res.json({ status: status, message: response_message })
            }
            else {
                user.password = password;
                user.save(function(err){
                    return res.json({ status: !err, message: __( err ? validate(err) : 'password_chenged_successfully' ) })
                })
            }
        };

        Users.findOne({
            username: username
        }).populate("data").exec(function(err, user) {
                user = user || {};
                var userData = (user.data ? user.data[0] : {}) || {}
                    ,response_message = false;
                if (user.id) {
                    response_message = __(urlencode.decode(key)==user.password ? (
                        password.length ? (
                            confirm_password.length ? (
                                password==confirm_password ? (
                                    response_message
                                    ) : "passwords_dont_mutch"
                                ) : "confirm_password_field_required"
                            ) : "password_field_required"
                        ) : "key_is_invalid");

                    !response_message ? do_and_response(user, password) : do_and_response(response_message);
                }
                else {
                    do_and_response(__(username.length ? 'user_not_found' : "username_field_required"));
                }
            });
    },
    /*END*/

    /*Account*/
    "account": function(req, res) {
        if(! req.session.user) { return req.session.href = req.url, res.redirect('/') };
        Users.findOne({
            id: req.session.user
        }).populate("data").exec(function(err, user) {
            user = user || {};
            var userData = (user.data ? user.data[0] : {}) || {};
            res.render('users/account', { userData: userData });
        });
    },
    "username-visibility": function(req, res) {
        if(! req.session.user) { return };
        var __ = res.i18n
            , validate = require('../../lib/helpers').validate;
        UserData.update({
            user: req.session.user
        },{
            public_user_name: req.body.visibility_username
        }, function(err, userData) {
            res.json( { status: ! err, message: __( err ? validate(err) : (req.body.visibility_username == "true" ? "username_changed_public" : "username_changed_private")) } );
        });
    },
    "name-visibility": function(req, res) {
        if(! req.session.user) { return };
        var __ = res.i18n
            ,validate = require('../../lib/helpers').validate;
        UserData.update({
            user: req.session.user
        },{
            public_full_name: req.body.visibility_name
        }, function(err, userData) {
            res.json({ status: ! err, message: __( err ? validate(err) : (req.body.visibility_name == "true" ? "name_changed_public" : "name_changed_private")) });
        });
    },
    /*END*/

    /*Change password*/
    "change-password" : function(req, res) {
        if(! req.session.user) { return req.session.href = req.url, res.redirect('/') };
        res.render('users/change_password');
    },
    "change-passwordPost": function(req, res) {
        if(! req.session.user) { return };
        var __ = res.i18n
            ,validate = require('../../lib/helpers').validate
            ,password = req.body.password
            ,passwordConfirm = req.body.confirm_password;
        if(password != passwordConfirm || (!password || !passwordConfirm)) { return res.json({ status: false, message: __(
            password ? (passwordConfirm ? "passwords_dont_mutch" : "confirm_password_field_required") : "password_field_required"
        ) }) }
        Users.update({
            id: req.session.user
        },{
            password: password
        }, function(err, users) {
            res.json( {status: ! err,  message : __( err ? validate(err) : 'password_chenged_successfully' ) });
        });
    },
    /*END*/

    /*Change picture*/
    "change-picture" : function(req, res) {
        if(! req.session.user) { return req.session.href = req.url, res.redirect('/') };
        Users.findOne({
            id: req.session.user
        }).populate("data").exec(function(err, user) {
                user = user || {};
                var userData = (user.data ? user.data[0] : {}) || {};
                res.render('users/change_picture', { userData: userData });
            });
    },
    "change-picturePost": function(req, res) {
        if(! req.session.user) { return };
        var image = require('../../config/upload').upload.avatar.ext
            ,path = require('path')
            ,uuid = require('uuid')
            ,directory = require('../../config/upload').upload.avatar.directory
            ,fs = require('fs');

        if (req.files.avatar && req.files.avatar.size > 0 && image.indexOf(req.files.avatar.type) != -1) {
            var fileExt = path.extname(req.files.avatar.path);
            var newFileName = uuid.v4() + fileExt;
            var is = fs.createReadStream(req.files.avatar.path);
            var os = fs.createWriteStream(directory + "/" + newFileName);
            is.pipe(os);
            UserData.update({
                user: req.session.user
            },{	picture: newFileName	}, function(err, userData) {
                res.redirect(req.url);
            });
        }
        else {
            res.redirect(req.url)
        }
    },
    /*END*/

    /*Delete Picture*/
    "delete-picture" : function(req, res) {
        if(! req.session.user) { return req.session.href = req.url, res.redirect('/') };
        Users.findOne({
            id: req.session.user
        }).populate("data").exec(function(err, user) {
                user = user || {};
                var userData = (user.data ? user.data[0] : {}) || {};
                res.render('users/delete_picture', { userData: userData });
            });
    },
    "delete-picturePost": function(req, res) {
        if(! req.session.user) { return };
        var __ = res.i18n;
        UserData.update({
            user: req.session.user
        },{
            picture: 'default_avatar.jpg'
        }, function(err, userData) {
            res.json( {status: ! err,  message : __( err ? validate(err) : '' ) });
        });
    },
    /*END*/

    /*Delete Picture*/
    "delete-account" : function(req, res) {
        if(! req.session.user) { return req.session.href = req.url, res.redirect('/') };
        res.render('users/delete_account');
    },
    "delete-accountPost": function(req, res) {
        if(! req.session.user) { return };
        var __ = res.i18n
            ,message = req.body.message
            ,validate = require('../../lib/helpers').validate
        Users.update({
            id: req.session.user
        },{
            is_active: false
        }, function(err, user) {
            UserData.update({
                user: req.session.user
            },{
                account_delete_reason: message
            }, function(userDataErr, userData) {
                res.json( {status: ! err,  message : __( err ? validate(err) : '' ) });
            });
        });
    },
    /*END*/

    /*Terms and conditions*/
    "terms-and-conditions": function(req, res) {
        if( req.session.user) { return res.redirect('/') };
        res.render('statics/terms_and_conditions')
    },
    /*END*/
    _config: {}
};
