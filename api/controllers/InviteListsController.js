module.exports = {

    "invite-lists": function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        var __ = res.i18n;
        InviteListService.getListsWithUsers(req.session.user, function(listErr, listRes) {
            return res.render("invite_lists/index", { lists: listRes || [] });
        });
    },

    removePost: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        var __ = res.i18n;
        InviteListService.removeInviteListWithUsers(req.body.id, function(delErr) {
            return res.json({ status: !delErr, message: __("invite_list_remove_" + (delErr ? "error" : "success")) });
        });
    },

    editInfoPost: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        var __ = res.i18n;
        InviteLists.findOne({ id: req.body.id }).exec(function(inviteListErr, inviteListRes) {
            InviteListUsers.find({ list_id: inviteListRes.id }).populate("user").exec(function(listUserErr, listUserRes) {
                inviteListRes.users = listUserRes;
                return res.json({
                    status: true,
                    message: __("invite_list_info_success"),
                    data: inviteListRes
                });
            });
        });
    },

    createPost: function(req, res) {
        if ( ! req.session.user ) { return req.session.href = req.url, res.redirect('/') };
        var __ = res.i18n;
        var post = req.body;
        if ( ! post.name ) {
            return res.json({ status: false, message: __("invite_list_create_no_name") });
        }
        if ( ! post.users && ! post.invite_ids ) {
            return res.json({ status: false, message: __("invite_list_create_no_users") });
        }
        var userIdStack = post.invite_ids || [];
        var userNameStack = [];
        var commaUsers, spaceUsers;
        if ( post.users ) {
            commaUsers = post.users.split(",");
            for ( var i in commaUsers ) {
                spaceUsers = commaUsers[i].split(" ");
                for ( var j in spaceUsers ) {
                    userNameStack.push(spaceUsers[j]);
                }
            }
        }
        var createList = function() {
            Users.find().where({ or: [
                { id: userIdStack },
                { username: userNameStack }
            ] }).exec(function(userErr, userRes) {
                if ( userRes.length ) {
                    req.body.owner_id = req.session.user;
                    InviteLists.create(req.body).exec(function(inviteListErr, inviteListRes) {
                        if ( ! inviteListErr ) {
                            var inviteListUsersQuery = userRes.map(function(elem) {
                                return {
                                    list_id: inviteListRes.id,
                                    user_id: elem.id
                                };
                            });
                            InviteListUsers.createEach(inviteListUsersQuery).exec(function(inviteListUserErr) {
                                if ( ! inviteListUserErr ) {
                                    return res.json({
                                        status: true,
                                        message: __("invite_list_create_success"),
                                        data: {
                                            0: inviteListRes.name,
                                            1: userRes.map(function(elem) {
                                                return elem.username;
                                            }),
                                            2: inviteListRes.createdAt
                                        }
                                    });
                                } else {
                                    return res.json({ status: false, message: __("invite_list_create_error") });
                                }
                            });
                        } else {
                            return res.json({ status: false, message: __("invite_list_create_error") });
                        }
                    });
                } else {
                    return res.json({ status: false, message: __("invite_list_create_wrong_ids") });
                }
            });
        };
        if ( post.edit_remove ) {
            InviteListService.removeInviteListWithUsers(post.edit_remove, createList);
        } else {
            createList();
        }
    },
    
    _config: {}

};