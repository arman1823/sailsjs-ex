/**
 * UserGroupCategories
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'user_group_categories',
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
        category: {
            columnName: 'category_id',
            model: 'GroupCategories'
        }
	}
};
