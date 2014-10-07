module.exports = {
    tableName: 'notification_events',
    attributes: {
        id: {
            type: 'integer',
            autoIncrement: true,
            primaryKey: true
        },
        forGroup: {
            columnName: 'group_id',
            model: 'Groups'
        },
        fromUser: {
            columnName: 'from_user_id',
            model: 'Users'
        },
        toUser: {
            columnName: 'to_user_id',
            model: 'Users'
        },
        vote: {
            type: 'integer',
            defaultsTo: null
        },
        event_type: {
            type: 'string',
            in: ['promote', 'demote', 'close', 'group_invite'],
            required: true
        },
        end_date: {
            type: 'datetime',
            defaultsTo: null
        }
    },
    afterCreate: function(res, cb) {
        NotificationEvents
          .findOne({ id: res.id })
          .populate("forGroup")
          .populate("fromUser")
          .populate("toUser")
          .exec(function(notifErr, notifRes) {
            var roomId = res.toUser + "" + "Notifications";
            console.log("Broadcasting push notification to room '" + roomId + "'.");
            sails.sockets.broadcast(roomId, "pushNotifications", notifRes);
            cb();
        });
    }
};