/**
 * GroupsCategories
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'group_invitations',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        fromGroup: {
            columnName: 'from_group_id',
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
        viewed: {
            type: 'boolean',
            defaultsTo: false
        }
	},
    afterCreate: function(res, cb) {
        NotificationEvents.create({
            group_id: res.fromGroup,
            from_user_id: res.fromUser,
            to_user_id: res.toUser,
            vote: 1,
            event_type: 'group_invite',
            end_date: new Date()
        }).exec(function(notifErr) {
            if ( notifErr ) console.log(notifErr);
            cb();
        });
    }
};
