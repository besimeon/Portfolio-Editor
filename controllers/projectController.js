const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
const passport = require('passport');
var Project = require('../models/project');
var GoogleUser = require('../models/googleUser');
var async = require('async');

// check if google user is in google users and return boolean:
function CheckMatchingUser(id, callback){
	GoogleUser.findOne({ 'id': id })
	.exec( function(err, found_googleUser) {
		if(err){
			callback(err, null);
		}
		if(found_googleUser){
			callback(null, true);
		}
		else{
			callback(null, false);
		}
	});
}

var list_projects = function(req, res, next){
	Project.find().sort('-displayOrder').exec(function(error, projects){
		if(error){
			return next(error);
		}
		res.render('project_list', {title: 'Projects', projects: projects});
	});
};

exports.index = function(req, res, next){
	list_projects(req, res, next);
};

exports.project_list = function(req, res, next){
	list_projects(req, res, next);
};

exports.project_detail = function(req, res, next){
	Project.findById(req.params.id).exec(function(error, project){
		if(error){
			return next(error);
		}
		res.render('project_detail', {title: 'Project Details', project: project});
	});
};

exports.project_create_get = function(req, res, next){
	async.parallel(
	{	// call checkmatchinguser which calls back with error or boolean values:
		matchingUser: function(callback){
			CheckMatchingUser(req.session.passport.user.id, callback);
		}
	},function(err, results){
		// if error, render page with error and exit:
		if(err){
			res.render('project_form', {msgNoMatchingUser: err});
			return;
		}
		// if matchingUser return value is false, no matching user is found. render page with message and exit:
		if(!results.matchingUser){
			res.render('project_form', {msgNoMatchingUser: "no matching user found"});
			return
		}
		// since estimatedDocumentCount() is asynchronous, call res functions in its callback:
		Project.find().estimatedDocumentCount().exec(function(err, count){
			if(err){
				res.render('project_form', {title: 'Create Project'});
			}
			res.render('project_form', {title: 'Create Project', estimatedDispOrder: count});
		});
	});
};

exports.project_create_post = [
	// validate each input:
	body('displayOrder', 'Display Order required').isLength({min:1}).trim(),
	body('image', 'Image required').isLength({min:1}).trim(),
	body('title', 'Title required').isLength({min:1}).trim(),
	body('URL', 'URL required').isLength({min:1}).trim(),
	body('description', 'description required').isLength({min:1}).trim(),
	body('langs', 'Languages required').isLength({min:1}).trim(),

	// sanitize:
	sanitizeBody('*').trim().escape(),

	// process request:
	(req, res, next) => {
		// repeat check for matching user in POST as well:
		async.parallel(
		{	// call checkmatchinguser which calls back with error or boolean values:
			matchingUser: function(callback){
				CheckMatchingUser(req.session.passport.user.id, callback);
			}
		},function(err, results){
			// if error, render page with error and exit:
			if(err){
				res.render('project_form', {msgNoMatchingUser: err});
				return;
			}
			// if matchingUser return value is false, no matching user is found. render page with message and exit:
			if(!results.matchingUser){
				res.render('project_form', {msgNoMatchingUser: "no matching user found"});
				return
			}
			
			// extract validation errors from request:
			const errors = validationResult(req);

			// create a project object:
			var project = new Project(
				{
					displayOrder: req.body.displayOrder,
					image: req.body.image,
					title: req.body.title,
					URL: req.body.URL,
					description: req.body.description,
					langs: req.body.langs.split(',')
				}
			);

			// if errors, render again w/ sanitized values + any errors & return:
			if(!errors.isEmpty()){
				res.render('project_form', {title: 'Create Project', project: project, errors: errors.array()});
				return;
			}

			// execute project object .save():
			else {
				project.save(function(err){
					if(err){
						return next(err);
					}
					// project has been saved, redirect to detail page:
					res.redirect(project.virtUrl);
				});
			}
		});
	}
];

exports.project_delete_get = function(req, res, next){
	async.parallel(
	{	// call checkmatchinguser which calls back with error or boolean values:
		matchingUser: function(callback){
			CheckMatchingUser(req.session.passport.user.id, callback);
		},
		project: function(callback){
			Project.findById(req.params.id).exec(callback);
		}
	},function(err, results){
		// if error, render page with error and exit:
		if(err){
			res.render('project_form', {msgNoMatchingUser: err});
			return;
		}
		// if matchingUser return value is false, no matching user is found. render page with message and exit:
		if(!results.matchingUser){
			res.render('project_form', {msgNoMatchingUser: "no matching user found"});
			return
		}
		// if no matching project found, return to project list:
		if(results.project == null){
			res.redirect('/');
			return;
		}
		res.render('project_delete', {title: 'Delete Project', project: results.project});
	});
};

exports.project_delete_post = [
	// validate body variables in POST as well:
	body('projectid').isLength({min:1}).trim(),

	// sanitize:
	sanitizeBody('*').trim().escape(),

	(req, res, next) => {
		async.parallel(
		{	// call checkmatchinguser which calls back with error or boolean values:
			matchingUser: function(callback){
				CheckMatchingUser(req.session.passport.user.id, callback);
			},
			project: function(callback){
				Project.findById(req.params.id).exec(callback);
			}
	    }, function(err, results){
	    	// extract validation errors from request:
			const errors = validationResult(req);

	    	// if errors, render again w/ sanitized values + any errors & return:
			if(!errors.isEmpty()){
				res.render('project_delete', {title: 'Delete Project', project: results.project, errors: errors.array()});
				return;
			}

	    	// if error, render page with error and exit:
			if(err){
				res.render('project_delete', {title: 'Delete Project', project: results.project, msgNoMatchingUser: err});
				return;
			}
			// if matchingUser return value is false, no matching user is found. render page with message and exit:
			if(!results.matchingUser){
				res.render('project_delete', {title: 'Delete Project', project: results.project, msgNoMatchingUser: "no matching user found"});
				return
			}
			// if no matching project found, return to project list:
			if(results.project == null){
				res.redirect('/');
				return;
			}
			Project.findByIdAndRemove(req.body.projectid, function(){
	            if(err){
	           		return next(err); 
	           	}
	            res.redirect('/');
	        });
	    });
	}
];

exports.project_update_get = function(req, res, next){
	async.parallel(
	{	// call checkmatchinguser which calls back with error or boolean values:
		matchingUser: function(callback){
			CheckMatchingUser(req.session.passport.user.id, callback);
		},
		project: function(callback){
			Project.findById(req.params.id).exec(callback);
		},
		estimatedDispOrder: function(callback){
			// since estimatedDocumentCount() is asynchronous, call res functions in its callback:
			Project.find().estimatedDocumentCount().exec(callback);
		}
	},function(err, results){
		// if error, render page with error and exit:
		if(err){
			res.render('project_form', {msgNoMatchingUser: err});
			return;
		}
		// if matchingUser return value is false, no matching user is found. render page with message and exit:
		if(!results.matchingUser){
			res.render('project_form', {msgNoMatchingUser: "no matching user found"});
			return
		}
		// if no matching project found, return to project list:
		if(results.project == null){
			res.redirect('/');
			return;
		}
		res.render('project_form', {title: 'Update Project', project: results.project, estimatedDispOrder: results.estimatedDispOrder});
	});
};

exports.project_update_post = [
	// validate each input:
	body('displayOrder', 'Display Order required').isLength({min:1}).trim(),
	body('image', 'Image required').isLength({min:1}).trim(),
	body('title', 'Title required').isLength({min:1}).trim(),
	body('URL', 'URL required').isLength({min:1}).trim(),
	body('description', 'description required').isLength({min:1}).trim(),
	body('langs', 'Languages required').isLength({min:1}).trim(),

	// sanitize:
	sanitizeBody('*').trim().escape(),

	(req, res, next) => {
		async.parallel(
		{	// call checkmatchinguser which calls back with error or boolean values:
			matchingUser: function(callback){
				CheckMatchingUser(req.session.passport.user.id, callback);
			}
	    }, function(err, results){
	    	// extract validation errors from request:
			const errors = validationResult(req);

			// create a project object:
			var project = new Project(
				{
					displayOrder: req.body.displayOrder,
					image: req.body.image,
					title: req.body.title,
					URL: req.body.URL,
					description: req.body.description,
					langs: req.body.langs.split(','),
					_id: req.params.id
				}
			);

	    	// if errors, render again w/ sanitized values + any errors & return:
			if(!errors.isEmpty()){
				res.render('project_form', {title: 'Update Project', project: results.project, errors: errors.array()});
				return;
			}

	    	// if error, render page with error and exit:
			if(err){
				res.render('project_form', {title: 'Update Project', project: results.project, msgNoMatchingUser: err});
				return;
			}
			// if matchingUser return value is false, no matching user is found. render page with message and exit:
			if(!results.matchingUser){
				res.render('project_form', {title: 'Update Project', project: results.project, msgNoMatchingUser: "no matching user found"});
				return;
			}
			// update project given the ID & handle response:
				// todo: is empty object {} needed?:
			Project.findByIdAndUpdate(req.params.id, project, {}, function(err){
				// if error returned, handle it:
	            if(err){
	           		return next(err); 
	           	}
	           	// redirect user to project page for given project ID:
	            res.redirect('/editor/project/'+req.params.id);
	        });
	    });
	}
];

exports.json_projects_all = function(req, res, next){
	Project.find().sort('-displayOrder').exec(function(error, projects){
		if(error){
			return next(error);
		}
		res.json(projects);
	});
};
