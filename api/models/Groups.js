/**
 * Groups
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'groups',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		name: {
			type: 'string',
			maxLength: 255,
			minLength: 3,
			required: true
		},
        createdBy: {
            columnName: 'creator_id',
            model: 'Users'
        },
		is_public: {
			type: 'boolean',
			defaultsTo: true
		},
		is_active: {
			type: 'boolean',
			defaultsTo: true
		},
		password: {
			type: 'string',
			minLength: 6,
			maxLength: 50,
			defaultsTo: ''
		},
        end_date: {
            type: 'datetime',
            defaultsTo: null
        }
	}
};