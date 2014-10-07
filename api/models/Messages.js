/**
 * Messages
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'messages',
    autoSubscribe: ["create", "update"],
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        fromUser: {
            columnName: 'from_user_id',
            model: 'Users'
        },
        toUser: {
            columnName: 'to_user_id',
            model: 'Users'
        },
        toGroup: {
            columnName: 'to_group_id',
            model: 'Groups'
        },
        toChat: {
            columnName: 'to_chat_id',
            model: 'PrivateChats'
        },
		message_type: {
			type: 'string',
			in: ['text', 'image', 'audio', 'video', 'binary']
		},
		message_body: {
			type: 'text',
			required: true,
			maxLength: 10000
		}
	}
};
