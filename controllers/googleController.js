const { body,validationResult } = require('express-validator/check');
var config = require('../config.json');
const { sanitizeBody } = require('express-validator/filter');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


function extractProfile(profile) {
	let imageUrl = '';
	if (profile.photos && profile.photos.length) {
		imageUrl = profile.photos[0].value;
	}
	return {
		id: profile.id,
		displayName: profile.displayName,
		image: imageUrl,
	};
}


// Configure the Google strategy for use by Passport.js.
// OAuth 2-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Google API on the user's behalf,
// along with the user's profile. The function must invoke `cb` with a user
// object, which will be set at `req.user` in route handlers after
// authentication.579729399504-gfipm8l9dopm5v6n9qrl4sue3r3h4e01.apps.googleusercontent.com
passport.use(
	new GoogleStrategy(
		{
			clientID: config.google.clientID,
			clientSecret: config.google.clientSecret,
			callbackURL: 'http://localhost:3000/editor/auth/google/callback',
			accessType: 'offline',
			userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
		},
		(accessToken, refreshToken, profile, cb) => {
			// Extract the minimal profile information we need from the profile object
			// provided by Google
			cb(null, extractProfile(profile));
		}
	)
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

// [START middleware]

// Middleware that requires the user to be logged in. If the user is not logged
// in, it will redirect the user to authorize the application and then return
// them to the original URL they requested.
function authRequired(req, res, next) {
  if (!req.user) {
    req.session.oauth2return = req.originalUrl;
    return res.redirect('/editor/auth/login');
  }
  next();
}

// return addUser form: 
// since template only uses profile, 
// it doesn't need any additional data:
function add_user_get(req, res){
	res.render('addUser');
}

// add user form data to database
add_user_post = [
	// validate the id field to avoid injection:
	body('id', ' id blank ').isLength({ min: 1 }).trim(),

	// sanitize: 
	sanitizeBody('id').trim().escape(),

	(req, res, next) => {
		// get validation errors:
		const errors = validationResult(req);

		// create user object: 
		var newUser = new GoogleUser(
			{ 
				id: req.body.id
			}
		);

		if(!errors.isEmpty()){
			res.render('addUser', { profile: newUser, errors: errors.array()});
			return;
		}
		else{
			// data is valid, check if user already exists & save if not:
			GoogleUser.findOne({ 'id': req.body.id })
			.exec( function(err, found_googleUser) {
				if(err){
					return next(err);
				}
				if(found_googleUser){
					res.render('addUser', { userAddedMsg: 'User already added '});
				}
				else{
					newUser.save(function(err){
						if(err){
							return next(err);
						}
						// user saved, return to add user page with confirmation:
						res.render('addUser', { userAddedMsg: 'User Added' });
					});
				}
			});
		}
	}
];

// Middleware that exposes the user's profile as well as login/logout URLs to
// any templates. These are available as `profile`, `login`, and `logout`.
function addTemplateVariables(req, res, next) {
 	res.locals.profile = req.user;
	res.locals.login = `/auth/login?return=${encodeURIComponent(
		req.originalUrl
	)}`;
	res.locals.logout = `/auth/logout?return=${encodeURIComponent(
		req.originalUrl
	)}`;
	next();
}
// [END middleware]

// [START controller functions]
function login_get_saveUrl(req, res, next) {
	if (req.query.return) {
      req.session.oauth2return = req.query.return;
    }
	next();
}

// redirect back to orig page if any:
function callback_get_redirectPostOauth2(req, res){
	const redirect = req.session.oauth2return || '/';
	delete req.session.oauth2return;
	res.redirect(redirect);
}

function logout_get(req, res){
	req.logout();
	res.redirect('/');
}

// [END controller functions]


module.exports = {
	add_user_get: add_user_get, 
	add_user_post: add_user_post, 
	callbackRedirectPostOauth2: callback_get_redirectPostOauth2,
	extractProfile: extractProfile,
	loginSaveUrl: login_get_saveUrl,
	logout: logout_get, 
	required: authRequired,
	template: addTemplateVariables,
};

