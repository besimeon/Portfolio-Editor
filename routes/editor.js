var express = require('express');
var router = express.Router();

// require controller modules:
var project_controller = require('../controllers/projectController');
var googleController = require('../controllers/googleController');

// routes:

// [START Google routes]

const passport = require('passport');

router.use(googleController.template);

// Begins the authorization flow. The user will be redirected to Google where
	// they can authorize the application to have access to their basic profile
	// information. Upon approval the user is redirected to `/auth/google/callback`.
	// If the `return` query parameter is specified when sending a user to this URL
	// then they will be redirected to that URL when the flow is finished.

// see comments in googleController re- moving of google controller functions:
router.get(
	// login URL: 
	'/auth/login',

	// function to save URL of current page:
	googleController.loginSaveUrl,

	// Start OAuth 2 flow using Passport.js
	passport.authenticate('google', {scope: ['email', 'profile']})
);

// oauth2 callback: 
	// router.get('/auth/google/callback', googleController.callbackFinishOauth2, googleController.callbackRedirectPostOauth2);
router.get(
	// OAuth 2 callback url. Use this url to configure your OAuth client in the
	// Google Developers console
	'/auth/google/callback', 
	
	// Finish OAuth 2 flow using Passport.js
	passport.authenticate('google'),

	// Redirect back to the original page, if any
	googleController.callbackRedirectPostOauth2
);

// logout: 
	// Deletes the user's credentials and profile from the session.
	// This does not revoke any active tokens.
router.get('/auth/logout', googleController.logout);

router.get('/auth/addUser', googleController.add_user_get);

router.post('/auth/addUser', googleController.add_user_post);

// [END google routes]


// home page:
router.get('/', project_controller.index);

// project list:
router.get('/projects', project_controller.project_list);

// project create GET: 
router.get('/project/create', googleController.required, project_controller.project_create_get);

// project create POST:
router.post('/project/create',  googleController.required, project_controller.project_create_post);

// project delete GET:
router.get('/project/:id/delete',  googleController.required, project_controller.project_delete_get);

// project delete POST:
router.post('/project/:id/delete',  googleController.required, project_controller.project_delete_post);

// project update GET:
router.get('/project/:id/update',  googleController.required, project_controller.project_update_get);

// project update POST:
router.post('/project/:id/update',  googleController.required, project_controller.project_update_post);

// project detail:
router.get('/project/:id', project_controller.project_detail);

// JSON endpoint: all projects:
router.get('/jsonAllProjects', project_controller.json_projects_all);

module.exports = router;