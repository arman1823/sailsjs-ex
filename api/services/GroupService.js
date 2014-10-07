var GroupService = {};

GroupService.getInvitations = function(where, cb) {
	var query = "SELECT *, g.`name` AS group_name FROM `group_invitations` AS gi " +
				"INNER JOIN `groups` AS g ON gi.`from_group_id` = g.`id` " +
				"INNER JOIN `users` AS u ON gi.`from_user_id` = u.`id` " +
				"INNER JOIN `user_data` AS ud ON u.id = ud.`user_id` " +
                "LEFT JOIN `group_users` AS gu ON gu.`group_id` = g.`id` AND gu.`user_id` = gi.`to_user_id` " +
				"WHERE ";
    var whereStack = [];
    for ( var i in where ) {
        if ( typeof where[i] === "object" ) {
            for ( var j in where[i] ) {
                whereStack.push(i + " " + j + " " + where[i][j]);
            }
        } else {
            whereStack.push(i + " = " + where[i]);
        }
    }
    query += whereStack.join(" AND ");
	GroupInvitations.query(query, cb);
};

GroupService.getUserGroups = function(userId, cb) {
	var query = "SELECT *, g.`id` AS groupId, g.`name` AS groupName, u.`username` AS adminUsername, g.`name` AS group_name, gc.`name` AS categoryName " +
                "FROM `group_users` AS gu " +
                "LEFT JOIN `groups` AS g ON gu.`group_id` = g.`id` " +
                "LEFT JOIN `users` AS u ON u.`id` = g.`creator_id`" +
                "LEFT JOIN `user_group_categories` AS ugc ON ugc.`group_id` = g.`id` AND ugc.`user_id` = " + userId + " " +
                "LEFT JOIN `group_categories` AS gc ON ugc.`category_id` = gc.`id` " +
				"WHERE gu.`user_id` = " + userId + " " +
				"AND gu.`leave_date` IS NULL " +
                "AND (g.`end_date` IS NULL OR g.`end_date` = '')";
    Groups.query(query, cb);
};

GroupService.getUserGroupsForCategories = function(userId, hasCategory, cb) {
	var query = "SELECT *, g.`id` AS groupId, ugc.`category_id` AS catId, u.`username` AS adminUsername, g.`name` AS group_name FROM `group_users` AS gu " +
                "LEFT JOIN `groups` AS g ON gu.`group_id` = g.`id` " +
                "INNER JOIN `users` AS u ON u.`id` = g.`creator_id` " +
                "LEFT JOIN `user_group_categories` AS ugc ON ugc.`user_id` = " + userId + " AND ugc.`group_id` = g.`id` " +
				"WHERE gu.`user_id` = " + userId + " " +
				"AND ugc.`category_id` IS " + (hasCategory ? "NOT " : "") + "NULL " +
                "AND (g.`end_date` IS NULL OR g.`end_date` = '')";
    Groups.query(query, cb);
};

GroupService.getArchivedGroups = function(opts, cb) {
    if ( typeof opts === "function" ) {
        cb = opts;
        opts = {};
    }
    var query = "SELECT *, g.`id` AS groupId, g.`name` AS group_name FROM `groups` AS g " +
                "WHERE (g.`end_date` IS NOT NULL AND g.`end_date` != '')";
    if ( opts.query ) {
        query += " AND g.`name` LIKE '%" + opts.query + "%'";
    }
    if ( opts.id ) {
        query += " AND g.`id` = " + opts.id;
    }
    Groups.query(query, function(archErr, archRes) {
        var asyncStack = [];
        var archiveStack = [];
        for ( var i in archRes ) {
            archRes[i].users = [];
            (function(i) {
                asyncStack.push(function(asyncDone) {
                    GroupService.getGroupUsers(archRes[i].id, function(gUserErr, gUserRes) {
                        archRes[i].users = gUserRes;
                        archiveStack.push(archRes[i]);
                        asyncDone(gUserErr);
                    });
                });
            })(i);
        }
        require("async").parallel(asyncStack, function(asyncErr) {
            cb(asyncErr, archiveStack);
        });
    });
};

GroupService.getGroupsWithMessages = function(opts, cb) {
    var asyncStack = [];
    var groupMessageStack = {};
    var groupResultHandler = function(ugroupErr, ugroupResult) {
        var msgGetParams = { target: 'group' };
        if ( opts.userId ) msgGetParams.currentUserId = opts.userId;
        for ( var i in ugroupResult ) {
            (function(i) {
                asyncStack.push(function(asyncDone) {
                    MessageService.getMessages(msgGetParams, ugroupResult[i].groupId, function(msgErr, msgResult) {
                        groupMessageStack[ ugroupResult[i].groupId ] = {
                            group: ugroupResult[i],
                            messages: msgResult
                        };
                        asyncDone(msgErr);
                    });
                });
            })(i);
        }
        require("async").parallel(asyncStack, function(asyncErr) {
            if ( asyncErr ) console.log(asyncErr);
            var asyncStack = [];
            for ( var i in groupMessageStack ) {
                groupMessageStack[i].admins = [];
                groupMessageStack[i].users = [];
                (function(i) {
                    asyncStack.push(function(asyncDone) {
                        GroupService.getGroupUsers(groupMessageStack[i].group.groupId, function(gUserErr, gUserRes) {
                            for ( var j in gUserRes ) {
                                groupMessageStack[i][gUserRes[j].role + "s"].push(gUserRes[j]);
                            }
                            asyncDone(gUserErr);
                        });
                    });
                })(i);
            }
            require("async").parallel(asyncStack, function(asyncErr) {
                cb(asyncErr, groupMessageStack);
            });
        });
    };
    if ( opts.userId ) {
        GroupService.getUserGroups(opts.userId, groupResultHandler);
    }
    if ( opts.groupId ) {
        Groups.findOne({ id: opts.groupId }).exec(function(groupErr, groupRes) {
            if ( groupRes ) {
                groupRes.groupId = groupRes.id;
                groupResultHandler(groupErr, [groupRes]);
            } else {
                console.log('ERROR! No group with id ' + opts.groupId + ' found');
            }
        });
    }
};

GroupService.getPrivateChatWithMessages = function(userId, cb) {
    var msgGetParams = {
        target: 'chat',
        currentUserId: userId
    };
    PrivateChats.findOne({ creator_id: userId }).exec(function(pChatErr, pChatResult) {
        MessageService.getMessages(msgGetParams, pChatResult.id, function(msgErr, msgResult) {
            var chatMessageStack = {
                chat: pChatResult,
                messages: msgResult
            };
            cb(msgErr, chatMessageStack);
        });
    });
};

GroupService.getGroupUsers = function(groupId, cb) {
    var query = "SELECT *, gu.`user_id` AS userId, pc.`id` AS privateChatId FROM `group_users` AS gu " +
                "INNER JOIN `users` AS u ON u.`id` = gu.`user_id` " +
                "INNER JOIN `user_data` AS ud ON ud.`user_id` = u.`id` " +
                "LEFT JOIN `private_chat_users` AS pcu ON pcu.`user_id` = gu.`user_id` " +
                "LEFT JOIN `private_chats` AS pc ON pc.`id` = pcu.`chat_id` " +
                "WHERE gu.`group_id` = " + groupId;
    Groups.query(query, cb);
};

GroupService.sendInvitations = function(groupId, fromUserId, inviteIds, cb) {
    var inviteQuery = inviteIds.map(function(elem) {
        return {
            from_group_id: groupId,
            from_user_id: fromUserId,
            to_user_id: elem
        };
    });
    GroupInvitations.createEach(inviteQuery).exec(cb);
};

GroupService.getGroupCategoriesForUser = function(userId, cb) {
    var query = "SELECT *, gc.`id` AS catId FROM `group_categories` AS gc " +
                "WHERE gc.`user_id` = " + userId;
    GroupCategories.query(query, cb);
};

GroupService.checkUsersBeenInGroup = function(fromUserid, toUserId, groupName, cb) {
    var query = "SELECT IF(COUNT(*) = 0, 0, 1) " +
                "FROM `group_users` AS gu " +
                "INNER JOIN `groups` AS g ON g.`id` = gu.`group_id` " +
                "INNER JOIN `users` AS u ON u.`id` = gu.`user_id` " +
                "INNER JOIN `group_users` AS gu2 ON gu2.`user_id` = " + fromUserid + " " +
                "AND gu2.`group_id` = gu.`group_id` " +
                "WHERE gu.`user_id` = " + toUserId + " " +
                "AND g.`name` = '" + groupName + "'";
    Groups.query(query, function(err, result) {
        result = result[0][Object.keys(result[0])[0]];
        cb(err, result);
    });
};

GroupService.findAdminedGroups = function(userId, archived, cb) {
    var query = "SELECT *, gu.`user_id` AS userId, `group_id` AS groupId " +
                "FROM `group_users` AS gu " +
                "INNER JOIN `groups` AS g ON g.`id` = gu.`group_id` " +
                "WHERE gu.`role` = 'admin' AND gu.`user_id` = " + userId;
    if ( ! archived ) {
        query += " AND (g.`end_date` IS NULL OR g.`end_date` = '')";
    }
    Groups.query(query, cb);
};

module.exports = GroupService;