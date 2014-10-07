/**
 * Users
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

function hash_password(attrs, next) {
	if(!attrs.password) {
		return next();
	}
    var bcrypt = require('bcrypt-nodejs');
    bcrypt.hash(attrs.password, null, null, function(err, hash) {
    	if (err) return next(err);
        attrs.password = hash;
        next();
	});
};

module.exports = {
    tableName: 'users',
	attributes: {
		id: {
			type: 'integer',
			autoIncrement: true,
			primaryKey: true
		},
		username: {
			type: 'string',
			minLength: 3,
			maxLength: 25,
			required: true,
			unique: true
		},
		password: {
			type: 'string',
			required: true,
			minLength: 6,
			maxLength: 50
		},
		is_active: {
			type: 'boolean',
            defaultsTo: 1
		},
		is_confirmed: {
			type: 'boolean',
            defaultsTo: 0
        },
        data: {
        	collection: 'UserData',
        	via: 'user'
        }
	},
    beforeCreate: hash_password,
    beforeUpdate: hash_password
};
