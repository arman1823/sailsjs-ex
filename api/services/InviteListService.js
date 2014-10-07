var InviteListService = {};

InviteListService.getListsWithUsers = function(userId, cb) {
    InviteLists.find({ owner_id: userId }).exec(function(inviteListErr, inviteListRes) {
        if ( inviteListErr ) console.log(inviteListErr);
        var asyncStack = [];
        inviteListRes.map(function(elem) {
            asyncStack.push(function(asyncDone) {
                InviteListUsers.find({ list_id: elem.id }).populate("user").exec(function(listUserErr, listUserRes) {
                    elem.users = listUserRes || [];
                    asyncDone(listUserErr);
                });
            });
            return elem;
        });
        require("async").parallel(asyncStack, function(asyncErr) {
            if ( asyncErr ) console.log(asyncErr);
            cb(asyncErr, inviteListRes);
        });
    });
};

InviteListService.removeInviteListWithUsers = function(listId, cb) {
    InviteLists.destroy({ id: listId }).exec(function(invErr) {
        InviteListUsers.destroy({ list_id: listId }).exec(cb);
    });
};

module.exports = InviteListService;
