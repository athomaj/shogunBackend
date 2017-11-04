var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: false, index: true },
	username: { type: String, required: true, index: true, initial: true },
	email: { type: Types.Email, initial: true, required: false, index: true },
	profileImage: { type: Types.CloudinaryImage },
	password: { type: Types.Password, initial: true, required: false },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Registration
 */
User.defaultColumns = 'username, name, email, isAdmin';
User.register();
