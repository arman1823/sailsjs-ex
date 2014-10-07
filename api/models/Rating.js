/**
 * Rating
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    tableName: 'rating',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		rate: {
			type: 'string',
			in: ['good', 'normal', 'bad'],
			required: true
		},
		rate_title: {
			type: 'string',
			maxLength: 30,
			minLength: 2,
			required: true
		},
        order: {
            type: 'integer',
            defaultsTo: 0
        }
	}
};