/**
 * GroupCategories
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'group_categories',
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
        name: {
            type: 'string',
            minLength: 3,
            maxLength: 50,
            required: true
        }
	}
};
