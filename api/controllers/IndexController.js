module.exports = {

    index: function(req, res) {
    	var user = req.session.user || false
    		,redirect = req.session.href || '/';
        var viewData = { user: user, redirect: redirect };

        if ( user ) {
            GroupService.getInvitations({
                to_user_id: user,
                viewed: 0,
                "gu.`user_id`": { "IS": null }
            }, function(groupInvErr, groupInvData) {
                viewData.invitations = groupInvData || [];
                return res.view("index", viewData);
            });
        } else {
            return res.view("index", viewData);
        }
    },

    subscribePost: function(req, res) {
        if ( ! req.session.user ) return res.json({ status: false });
        var roomId = req.session.user + "Notifications";
        console.log("Joining to socket room '" + roomId + "'.");
        sails.sockets.join(req.socket, roomId);
        return res.json({ status: true });
    },

    getNotificationsPost: function(req, res) {
        if ( ! req.session.user ) return res.json({ status: false });
        NotificationEvents
          .find({ to_user_id: req.session.user })
          .populate("forGroup")
          .populate("fromUser")
          .populate("toUser")
          .limit(5)
          .exec(function(notifErr, notifRes) {
            if ( notifErr ) console.log(notifErr);
            return res.json({ status: true, notifications: notifRes });
        });
    }

};