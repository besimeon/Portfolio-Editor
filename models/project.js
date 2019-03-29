var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProjectSchema = new Schema(
	{
		displayOrder: {type: Number, required: true},	// display order
		image: {type: String, required: true},			// image
		title: {type: String, required: true},			// title
		URL: {type: String, required: true},			// URL 
		description: {type: String, required: true},	// descripts
		langs: [{type: String}]							// langs
	}
);

ProjectSchema
.virtual('virtUrl')
.get(function(){
	return '/editor/project/' + this._id;
});

module.exports = mongoose.model('Project', ProjectSchema);