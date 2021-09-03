import passport from 'passport';
import LocalStrategy from 'passport-local';
import _ from 'underscore';

import User from '../modules/users/users.model';

const Strategy = LocalStrategy.Strategy;

export default function() {  
	passport.use('users', new Strategy({
		usernameField: 'email',
		passwordField: 'password'
	}, async (username, password, done) => {
		let user = await User.find({ email: username });
		
		if (user.length == 0) {
			return done(null, false, {error: 'User not found', value: ''});
		}

		user = user[0];
		
		if (!user.validPassword(password)) {
			return done(null, false, {error: 'Incorrect Password', value: ''});
		}
		
		return done(null, user);
	}));
}