/**
 * GroupUsers
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'group_users',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        user: {
            columnName: 'user_id',
            model: 'Users'
        },
        group: {
            columnName: 'group_id',
            model: 'Groups'
        },
        join_date: {
            type: 'datetime',
            defaultsTo: new Date()
        },
        leave_date: {
            type: 'datetime',
            defaultsTo: null
        },
		role: {
			type: 'string',
			in: ['admin', 'user'],
			defaultsTo: 'user'
		}
	}
};

