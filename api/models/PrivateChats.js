/**
 * PrivateChats
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'private_chats',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
        createdBy: {
            columnName: 'creator_id',
            model: 'Users'
        }
	}
};
