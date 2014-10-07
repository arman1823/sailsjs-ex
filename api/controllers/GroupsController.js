module.exports = {

    groups: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') }
        var viewData = {};
        var currentUserId = req.session.user;
        var renderHomepage = function(pChatErr, pChatRes) {
            GroupService.getPrivateChatWithMessages(currentUserId, function(pChatErr, pChatRes) {
                viewData.myPrivateChat = pChatRes;
                return res.render("groups/index", viewData);
            });
        };
        GroupService.getGroupsWithMessages({ userId: currentUserId }, function(groupErr, groupRes) {
            viewData.userGroups = groupRes;
            viewData.groupsByCategories = {
                categorized: {},
                uncategorized: []
            };
            var catName;
            for ( var i in groupRes ) {
                catName = groupRes[i].group.categoryName;
                if ( catName ) {
                    if ( ! viewData.groupsByCategories.categorized[catName] ) {
                        viewData.groupsByCategories.categorized[catName] = [];
                    }
                    viewData.groupsByCategories.categorized[catName].push(groupRes[i]);
                } else {
                    viewData.groupsByCategories.uncategorized.push(groupRes[i]);
                }
            }
            PrivateChats.findOne({ creator_id: currentUserId }).exec(function(pChatErr, pChatRes) {
                if ( pChatRes ) {
                    renderHomepage(pChatErr, pChatRes);
                } else {
                    PrivateChats.create({
                        creator_id: currentUserId
                    }).exec(renderHomepage);
                }
            });
        });
    },

	create: function(req, res) {
		if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
		return res.render("groups/create");
	},

	createPost: function(req, res) {
		if ( ! req.session.user ) { return };
		var __ = res.i18n
               , validate = require('../../lib/helpers').validate;
        var inviteIds = req.body.invite_ids || [];
        inviteIds = inviteIds.filter(function(elem) { return !!elem; });
        req.body.creator_id = req.session.user;
        Groups.create(req.body).exec(function(groupErr, groupData) {
            if ( groupErr ) {
                console.log(groupErr);
                var errAttrs = groupErr.invalidAttributes;
                if ( errAttrs ) {
                    return res.json({
                        status: false,
                        message: __("group_create_field_validation_error"),
                        reason: "validation_error",
                        errorFields: errAttrs
                    })
                }
            }
            GroupUsers.create({
                user_id: req.session.user,
                group_id: groupData.id,
                role: "admin"
            }).exec(function(groupUserErr) {
                if ( ! groupErr ) {
                    if ( inviteIds.length ) {
                        GroupService.sendInvitations(groupData.id, req.session.user, inviteIds, function(groupInvErr) {
                            if ( ! groupInvErr ) {
                                return res.json({ status: true, message: __("group_created") });
                            } else {
                                return res.json({ status: false, message: __("invitations_send_error") });
                            }
                        });
                    } else {
                        return res.json({ status: true, message: __("group_created") });
                    }
                } else {
                    return res.json({ status: false, message: __(groupErr ? validate(groupErr) : "group_create_error") });
                }
            });
        });
	},

    join: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/'); }
        else {
            var user = req.session.user,
                redirect = req.session.href || '/',
                viewData = { user: user, redirect: redirect };

            GroupService.getInvitations({
                to_user_id: user,
                viewed: 0,
                "gu.`user_id`": { "IS": null }
            }, function(groupInvErr, groupInvData) {
                viewData.invitations = groupInvData || [];
                return res.view("groups/groups_join", viewData);
            });
        }
    },

    joinPost: function(req, res) {
		var __ = res.i18n;
        var groupType = req.body.group_type || "public";
        if ( groupType == "public" ) {
            GroupUsers.create({
                user_id: req.session.user,
                group_id: req.body.group_id,
                join_date: new Date()
            }).exec(function(groupErr) {
                if ( ! groupErr ) {
                    return res.json({ status: true, message: __("joined_to_group_msg") });
                } else {
                    return res.json({ status: false, message: __("group_join_error_msg") });
                }
            });
        } else {
            var groupName = req.body.group_name;
            var groupPasswd = req.body.group_pwd;
            if ( groupName && ! groupPasswd ) {
                return res.json({ status: false, message: __("group_join_no_passwd_error") });
            } else {
                Groups.findOne({
                    is_public: 0,
                    name: groupName,
                    password: groupPasswd
                }).exec(function(groupErr, groupRes) {
                    if ( groupErr ) console.log(groupErr);
                    if ( groupRes ) {
                        GroupUsers.create({
                            user_id: req.session.user,
                            group_id: groupRes.id,
                            join_date: new Date()
                        }).exec(function(groupUsersErr) {
                            if ( ! groupUsersErr ) {
                                return res.json({ status: true, message: __("joined_to_group_msg") });
                            } else {
                                return res.json({ status: false, message: __("private_group_join_error_msg") });
                            }
                        });
                    } else {
                        return res.json({ status: false, message: __("no_such_private_group_or_passwd_error") });
                    }
                });
            }
        }
    },

    sendInvitationsPost: function(req, res) {
        var __ = res.i18n;
        var groupId = parseInt(req.body.groupId);
        var inviteIds = req.body.inviteIds;
        GroupService.sendInvitations(groupId, req.session.user, inviteIds, function(groupInvErr) {
            if ( ! groupInvErr ) {
                return res.json({ status: true, message: __("invitations_sent") });
            } else {
                console.log(groupInvErr);
                return res.json({ status: false, message: __("invitations_send_error") });
            }
        });
    },

	_config: {}

};