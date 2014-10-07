/**
 * MessageRating
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'message_rating',
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
        message: {
            columnName: 'message_id',
            model: 'Messages'
        },
		rate: {
            columnName: 'rate_id',
			model: 'Rating'
		}
	}
};