/**
 * InviteLists
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'invite_lists',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: 'string',
			minLength: 3,
			maxLength: 25,
			required: true
		},
        owner: {
            columnName: 'owner_id',
            model: 'Users'
        }
	}
};