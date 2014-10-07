/**
 * UserData
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'user_data',
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
		full_name: {
			type: 'string',
			maxLength: 255,
			required: true
		},
		email: {
			type: 'string',
			required: true,
            unique: true,
            email: true
		},
		picture: {
			type: 'string',
			defaultsTo: 'default_avatar.jpg'
		},
		public_full_name: {
			type: 'boolean',
			defaultsTo: 1
		},
		public_user_name: {
			type: 'boolean',
			defaultsTo: 1
		},
		account_delete_reason: {
			type: 'text'
		}
	}
};
