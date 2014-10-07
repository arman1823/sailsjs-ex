var VoteController = {
    VoteFor: {},
    VoteRespondFor: {}
};


VoteController.spam = function(req, res) {
    if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
    var msgId = req.params.id;
    var __ = res.i18n;
    Messages.findOne({ id: msgId }).exec(function(msgErr, msgRes) {
        if ( msgErr ) console.log(msgErr);
        if ( msgRes ) {
            msgRes.spam_count = parseInt(msgRes.spam_count) + 1;
            msgRes.save(function(msgErr) {
                if ( msgErr ) {
                    console.log(msgErr);
                    return res.json({ status: false, message: __("spam_report_error") });
                } else {
                    return res.json({ status: true, message: __("spam_report_ok") });
                }
            });
        } else {
            return res.json({ status: false, message: __("no_msg_found_error") });
        }
    });
};

VoteController.subscribePost = function(req, res) {
    var userId = req.session.user;
    GroupService.findAdminedGroups(userId, false, function(admGroupErr, admGroupRes) {
        if ( admGroupErr ) console.log(admGroupErr);
        var groupIds = admGroupRes.map(function(elem) {
            return elem.groupId;
        });
        // join to all groupClose socket rooms where we have an "admin" role
        groupIds.map(function(groupId, i) {
            voteSubscribeAllEvents(req.socket, admGroupRes[i].userId, groupId);
        });
        return res.json({ status: !admGroupErr, adminGroupIds: groupIds || {} });
    });
};


// vote helper functions

var voteSubscribe = function(socketId, userId, groupId, action) {
    var roomId = userId + "" + groupId + action;
    console.log("Joining to socket room '" + roomId + "'.");
    sails.sockets.join(socketId, roomId);
};

var voteUnSubscribe = function(socketId, userId, groupId, action) {
    var roomId = userId + "" + groupId + action;
    console.log("Leaving socket room '" + roomId + "'.");
    sails.sockets.leave(socketId, roomId);
};

var voteSubscribeAllEvents = function(socketId, userId, groupId) {
    voteSubscribe(socketId, userId, groupId, "groupClose");
    voteSubscribe(socketId, userId, groupId, "adminPromote");
    voteSubscribe(socketId, userId, groupId, "adminDemote");
};

var voteUnSubscribeAllEvents = function(socketId, userId, groupId) {
    voteUnSubscribe(socketId, userId, groupId, "groupClose");
    voteUnSubscribe(socketId, userId, groupId, "adminPromote");
    voteUnSubscribe(socketId, userId, groupId, "adminDemote");
};

var voteBroadcast = function(userId, groupId, action, data) {
    var roomId = userId + "" + groupId + action;
    var eventName = "vote" + utils.ucFirst(action);
    data = data || {};
    console.log("Broadcasting" + (data.type ? " '" + data.type + "'" : "") + " to room '" + roomId + "' for event '" + eventName + "'.");
    sails.sockets.broadcast(roomId, eventName, data);
};

var voteIsFinished = function(votes) {
    var flag = true;
    for ( var i in votes ) {
        flag &= (votes[i].vote !== null);
    }
    return flag;
};

var voteIsPositive = function(votes) {
    var voteStack = [ [ /* vote downs */ ], [ /* vote ups */ ] ];
    for ( var i in votes ) {
        voteStack[votes[i].vote].push(votes[i].id);
    }
    return voteStack[1].length > voteStack[0].length;
};


// generic vote controllers that redirect to the specific ones

VoteController.mainPost = function(req, res) {
    if ( ! req.session.user ) { return req.session.href = req.url, res.redirect("/") };
    var forParam = req.params.for;
    var forFunc = VoteController.VoteFor[forParam];
    if ( ! forParam || ! forFunc ) return res.redirect("/");
    var userId = req.session.user;
    var groupId = req.body.group_id;
    GroupUsers.findOne({ group_id: groupId }).exec(function(groupUserErr, groupUser) {
        if ( groupUserErr ) return console.log(groupUserErr);
        var voteInst = new forFunc(req, res);
        var voteCase = "user";
        if ( groupUser.role != voteCase ) {
            voteCase = groupUser.role;
        }
        if ( voteCase == "user" ) {
            // we are a plain user (not admin)
            return voteInst[voteCase](userId);
        } else {
            GroupUsers.find({
                role: groupUser.role,
                group_id: groupId,
                user: { not: userId }
            }).populate("group").exec(function(groupAdminErr, groupAdmins) {
                if ( groupAdminErr ) console.log(groupAdminErr);
                if ( ! groupAdmins.length ) {
                    // we are the only admin in this case
                    voteCase = "singleAdmin";
                    return voteInst[voteCase](groupId);
                } else {
                    var data = {};
                    Users.findOne({ id: userId }).populate("data").exec(function(currentUserErr, currentUserRes) {
                        if ( currentUserErr ) console.log(currentUserErr);
                        data.type = "initiate";
                        data.currentUser = currentUserRes;
                        data.groupInfo = groupAdmins[0].group;
                        var notificationEventQuery = groupAdmins.map(function(elem) {
                            return {
                                group_id: groupId,
                                from_user_id: userId,
                                to_user_id: elem.user,
                                event_type: forParam
                            };
                        });
                        NotificationEvents.createEach(notificationEventQuery).exec(function(notEvErr) {
                            if ( notEvErr ) console.log(notEvErr);
                            return voteInst[voteCase](userId, groupId, groupAdmins, function(addData) {
                                groupAdmins.map(function(adminObj) {
                                    if ( addData instanceof Object ) {
                                        for ( var i in addData ) {
                                            data[i] = addData[i];
                                        }
                                    }
                                    voteBroadcast(adminObj.user, req.body.group_id, voteInst.event, data);
                                });
                            });
                        });
                    });
                }
            });
        }
    });
};

VoteController.respondPost = function(req, res) {
    if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
    var forParam = req.params.for;
    var forFunc = VoteController.VoteRespondFor[forParam];
    var vote = req.body.vote;
    var groupId = req.body.groupId;
    var respondTo = req.body.respondTo;
    if ( ! forParam || ! forFunc ) return res.redirect("/");
    NotificationEvents.update({
        group_id: groupId,
        to_user_id: req.session.user,
        event_type: forParam
    }, { vote: vote ? 1 : 0 }).exec(function(updErr) {
            if ( updErr ) return console.log(updErr);
            var voteInst = new forFunc(req, res);
            var voteCase = "no";
            var allNotificationsQuery = {
                group_id: groupId,
                event_type: forParam,
                end_date: null
            };
            NotificationEvents.find(allNotificationsQuery).populate("forGroup").exec(function(allVotesErr, allVotesRes) {
                if ( allVotesErr ) return console.log(allVotesErr);
                var data = {
                    type: "response",
                    group: allVotesRes.length ? allVotesRes[0].forGroup : {}
                };
                if ( voteIsFinished(allVotesRes) ) {
                    data.votePassed = voteIsPositive(allVotesRes);
                    NotificationEvents.update(allNotificationsQuery,
                        { end_date: new Date() }
                    ).exec(function(updErr) {
                            if ( updErr ) console.log(updErr);
                            var broadcastVotes = function(addData) {
                                if ( addData instanceof Object ) {
                                    for ( var i in addData ) {
                                        data[i] = addData[i];
                                    }
                                }
                                allVotesRes.map(function(voteRes, i) {
                                    if ( i == 0 ) {
                                        // broadcast vote result info for the user who initiated the vote (fromUser)
                                        voteBroadcast(voteRes.fromUser, voteRes.forGroup.id, respondTo, data);
                                    }
                                    // broadcast vote result to all other subscribed users
                                    voteBroadcast(voteRes.toUser, voteRes.forGroup.id, respondTo, data);
                                });
                            };
                            if ( data.votePassed ) voteCase = "yes";
                            return voteInst[voteCase](groupId, broadcastVotes);
                        });
                } else {
                    voteCase = "progress";
                    return voteInst[voteCase](groupId, function() {});
                }
            });
        });
};


// specific vote controllers (all non-generic actions taken here)

VoteController.VoteFor.close = function(req, res) {

    this.event = "groupClose";

    this.user = function(id) {
        GroupUsers.update({ id: id }, { leave_date: new Date() }, function(userErr) {
            if ( userErr ) console.log(userErr);
            return res.json({ status: !userErr });
        });
    };

    this.admin = function(userId, groupId, groupAdmins, callback) {
        callback();
    };

    this.singleAdmin = function(groupId) {
        Groups.update({ id: groupId }, { end_date: new Date() }).exec(function(groupUpdErr) {
            if ( groupUpdErr ) console.log(groupUpdErr);
            return res.json({ status: !groupUpdErr });
        });
    };

};

VoteController.VoteFor.promote = function(req, res) {

    this.event = "adminPromote";

    this.user = function(id) { };

    this.admin = function(userId, groupId, groupAdmins, callback) {
        Users.findOne({ id: req.body.user_id }).populate("data").exec(function(userErr, userRes) {
            callback({
                promotableUser: userRes
            });
        });
    };

    this.singleAdmin = function(groupId) {
        var userId = req.body.user_id;
        GroupUsers.update({ group_id: groupId, user_id: userId }, { role: "admin" }).exec(function(gUserErr) {
            if ( gUserErr ) console.log(gUserErr);
            voteSubscribeAllEvents(req.socket, userId, groupId);
            return res.json({ status: !gUserErr });
        });
    };

};

VoteController.VoteFor.demote = function(req, res) {

    this.event = "adminDemote";

    this.user = function(id) { };

    this.admin = function(userId, groupId, groupAdmins, callback) {
        Users.findOne({ id: req.body.user_id }).populate("data").exec(function(userErr, userRes) {
            callback({
                promotableUser: userRes
            });
        });
    };

    this.singleAdmin = function(groupId) {
        var userId = req.body.user_id;
        GroupUsers.update({ group_id: groupId, user_id: userId }, { role: "user" }).exec(function(gUserErr) {
            if ( gUserErr ) console.log(gUserErr);
            voteUnSubscribeAllEvents(req.socket, userId, groupId);
            return res.json({ status: !gUserErr });
        });
    };

};


// response controllers

VoteController.VoteRespondFor.close = function(req, res) {

    this.progress = function() {
        return res.json({ status: false });
    };

    this.yes = function(groupId, callback) {
        Groups.update({ id: groupId }, { end_date: new Date() }).exec(function(groupUpdErr) {
            if ( groupUpdErr ) console.log(groupUpdErr);
            callback();
            return res.json({ status: !groupUpdErr });
        });
    };

    this.no = function(groupId, callback) {
        callback();
        return res.json({ status: false });
    };

};

VoteController.VoteRespondFor.promote = function(req, res) {

    this.progress = function() {
        return res.json({ status: false });
    };

    this.yes = function(groupId, callback) {
        var userId = req.body.userId;
        GroupUsers.update({ group_id: groupId, user_id: userId }, { role: "admin" }).exec(function(gUserErr) {
            if ( gUserErr ) console.log(gUserErr);
            Users.findOne({ id: userId }).populate("data").exec(function(userErr, userRes) {
                voteSubscribeAllEvents(req.socket, userId, groupId);
                callback({
                    promotableUser: userRes
                });
                return res.json({ status: !gUserErr });
            });
        });
    };

    this.no = function(groupId, callback) {
        var userId = req.body.userId;
        Users.findOne({ id: userId }).populate("data").exec(function(userErr, userRes) {
            callback({
                promotableUser: userRes
            });
            return res.json({ status: false });
        });
    };

};

VoteController.VoteRespondFor.demote = function(req, res) {

    this.progress = function() {
        return res.json({ status: false });
    };

    this.yes = function(groupId, callback) {
        var userId = req.body.userId;
        GroupUsers.update({ group_id: groupId, user_id: userId }, { role: "user" }).exec(function(gUserErr) {
            if ( gUserErr ) console.log(gUserErr);
            Users.findOne({ id: userId }).populate("data").exec(function(userErr, userRes) {
                voteUnSubscribeAllEvents(req.socket, userId, groupId);
                callback({
                    promotableUser: userRes
                });
                return res.json({ status: !gUserErr });
            });
        });
    };

    this.no = function(groupId, callback) {
        var userId = req.body.userId;
        Users.findOne({ id: userId }).populate("data").exec(function(userErr, userRes) {
            callback({
                promotableUser: userRes
            });
            return res.json({ status: false });
        });
    };

};


VoteController._config = {};
module.exports = VoteController;