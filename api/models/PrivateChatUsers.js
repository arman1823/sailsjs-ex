/**
 * PrivateChatUsers
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'private_chat_users',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        chat: {
            columnName: 'chat_id',
            model: 'PrivateChats'
        },
        user: {
            columnName: 'user_id',
            model: 'Users'
        }
	}
};
