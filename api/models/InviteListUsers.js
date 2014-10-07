/**
 * InviteListUsers
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'invite_list_users',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        list: {
            columnName: 'list_id',
            model: 'InviteLists'
        },
        user: {
            columnName: 'user_id',
            model: 'Users'
        }
  	}
};
