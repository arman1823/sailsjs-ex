module.exports.validator = {
    name: {
        minLength: 'name_too_short',
        maxLength: 'name_too_long',
        required: 'name_is_required'
    },
	password: {
		minLength: 'password_minLength_err',
		maxLength: 'password_maxLength_err',
		required: 'password_field_required'
	},
	username: {
		minLength: 'username_minLength_err',
		maxLength: 'username_maxLength_err',
		required: 'username_field_required',
		unique: 'user_already_exist'
	},
	email: {
		email: 'not_valid_email',
		unique: 'email_already_exist'
	},
	unhandled: {
		unhandled: 'unknown_error'
	}
};