var MessagesController = {};

MessagesController.messages = function(req, res) {
    if (!req.session.user) {
        return req.session.href = req.url, res.redirect('/')
    }
    MessageService.getMessages({
        target: 'user',
        last: true
    }, req.session.user, function(err, messages) {
        if (err) {
            console.log(err)
        }
        res.render("messages/inbox", {
            messages: messages || []
        });
    })
};

MessagesController.sendMessage = function(message) {
    var req = this.req;
    var res = this.res;
    var room = messageRoomJoin(req);
    Messages.create(message)
        .exec(function(err, message) {
            if (err) { return console.log(err) }
            message = message || {};
            UserData.findOne({
                user_id: message.fromUser
            }).exec(function(err, obj) {
                message.full_name = obj.full_name;
                res.render("partial/message_content", {
                    el: message
                }, function(err, html) {
                    sails.sockets.broadcast(room, 'chatMessage', {
                        message: html
                    });
                    console.log('Send message to room', room);
                });

            });
        });
    res.end();
};

MessagesController.messagesUser = function(req, res) {
    if (!req.session.user) {
        return req.session.href = req.url, res.redirect('/')
    };
    var un = require('../../lib/helpers').un;
    MessageService.getMessages({
        target: 'user',
        from_username: req.param('key'),
        reverse: true
    }, req.session.user, function(err, messages) {
        if (err) {
            console.log(err)
        }
        messages.every(function(el) {
            if (el.from_user_id != req.session.user) {
                req.session.toUser = el.from_user_id;
                return false;
            } else {
                return true;
            }

        });
        var last_message = messages[messages.length - 1] || {};
        res.render("messages/one_on_one", {
            messages: messages || []
        });
    })
};

var messageRoomJoin = function(req){
    var un = require('../../lib/helpers').un
        , room = req.body.room
        , roomData0 = parseInt(req.body.roomData0)
        , roomData1 = parseInt(req.body.roomData1)
        , roomName
        , groupChatSeccondNumber = 1000;

    switch (room) {
        case 'chat':
            roomName = 'PrivateChat' + un([roomData0, roomData1]);
            break;
        case 'group':
            roomName = 'GroupChat' + un([roomData0, groupChatSeccondNumber]);
            break;
    }
    return roomName;
}


MessagesController.room = function(req, res) {
    var room = messageRoomJoin(req);
    console.log('Request to create (join) a room ->', room);
    sails.sockets.join(req.socket, room);
    res.json({status: true});
};

MessagesController["send-messagePost"] = function(req, res) {
    var message = {
            fromUser: req.session.user,
            message_type: 'text',
            message_body: req.body.message
        }
        , __ = res.i18n
        , messageField = req.body.message
        , groupField = req.body.group
        , cityField = req.body.city
        , usernameField = req.body.username
        , error_message = ''
        , to = req.query.to
        , inbox = req.query.inbox;

    var field = "to" + to;

    if (!messageField) {
        return res.json({
            error: true,
            message: __('message_field_required')
        });
    }


    if(inbox) {
        if(!usernameField) {
            return res.json({
                error: true,
                message: __("username_field_required")
            });
        }
        if(!groupField) {
            return res.json({
                error: true,
                message: __("group_field_required")
            });
        }
        Users.findOne({ username: usernameField })
            .exec(function(err, user) {
                if (err) { console.log(err) }
                if (!user) {
                    return res.json({
                        error: true,
                        message: __("user_not_found")
                    });
                }
                GroupService.checkUsersBeenInGroup(req.session.user, user.id, groupField, function(err, result) {
                    console.log(result)
                    if(err) { console.log(err) }
                    if(result) {
                        message[field] = user.id;
                        Messages.create(message).exec(function(err, message) {
                            if (err) { console.log(err) }
                            return res.json({
                                status: true,
                                message: __("message_send")
                            });
                        })
                    } else {
                        return res.json({
                            error: true,
                            message: __("invalid_group_name")
                        });
                    }
                })
            })
    } else {
        message[field] = parseInt(req.body.to)
        MessagesController.sendMessage.call({ req: req, res: res }, message);
    }

};

MessagesController["send-message-filePost"] = function(req, res) {

    var uuid = require('node-uuid')
        , path = require('path')
        , results = []
        , file_type = req.param('key')
        , __ = res.i18n
        , streamOptions = {}
        , messageField = req.body.message
        , groupField = req.body.group
        , cityField = req.body.city
        , usernameField = req.body.username
        , error_message = new String()
        , to = req.query.to
        , inbox = req.query.inbox
        , field = "to" + to
        , room = messageRoomJoin(req);;

    if(inbox) {
        if(!usernameField) {
            return res.json({
                error: true,
                message: __("username_field_required")
            });
        }
        if(!groupField) {
            return res.json({
                error: true,
                message: __("group_field_required")
            });
        }
        Users.findOne({ username: usernameField })
            .exec(function(err, user) {
                if (err) { console.log(err) }
                if (!user) {
                    return res.json({
                        error: true,
                        message: __("user_not_found")
                    });
                }
                GroupService.checkUsersBeenInGroup(req.session.user, user.id, groupField, function(err, result) {
                    if(err) { console.log(err) }
                    if(result) {
                        message[field] = user.id;
                        Messages.create(message)
                            .exec(function(err, message) {
                                if (err) { console.log(err) }
                                return res.json({
                                    status: true,
                                    message: __("message_send")
                                });
                            })
                    }
                    else {
                        return res.json({
                            error: true,
                            message: __("invalid_group_name")
                        });
                    }
                })
            })
    }
    else {
        streamOptions = {
            dirname: require('../../config/upload').upload.message[file_type].directory + '/',
            ext: require('../../config/upload').upload.message[file_type].ext,
            saveAs: function(file) {
                var filename = file.filename,
                    newName = uuid.v4() + path.extname(filename);
                return newName;
            },
            completed: function(fileData, done) {
                var message = {
                    fromUser: req.session.user,
                    message_type: file_type,
                    message_body: fileData.localName
                };

                message[field] = parseInt(req.body.to);

                Messages.create(message)
                    .exec(function(err, message) {
                        if (err) {
                            console.log(err);
                            done();
                        } else {
                            res.render("partial/message_content", {
                                el: message || []
                            }, function(err, html) {
                                sails.sockets.broadcast(room, 'chatMessage', {
                                    message: html
                                });
                                console.log('Send message to room', room);
                                done();
                            });
                        }
                    });
            }
        };
    }

    req.file('file').upload(Uploader.documentReceiverStream(streamOptions), function(err, files) {
        return res.json(err ? {
            error: true,
            message: __(err)
        } : {
            status: true
        });
    });
};

MessagesController.ratePost = function(req, res) {
    var rateType = req.params.type;
    Rating.findOne({
        rate: rateType
    }).exec(function(ratingErr, ratingResult) {
        if (ratingErr) return console.log(ratingErr);
        if (!ratingResult) return console.log("No rate '" + rateType + "' found in database.");
        MessageRating.create({
            user_id: req.session.user,
            message_id: req.params.id,
            rate_id: ratingResult.id
        }).exec(function(msgRateErr, msgRateResult) {
            return res.json({
                status: !! msgRateErr,
                errors: msgRateErr
            });
        });
    });
};

module.exports = MessagesController;