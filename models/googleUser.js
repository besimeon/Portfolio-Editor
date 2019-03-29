var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var GoogleUserSchema = new Schema(
	{
		id: {type: Number, required: true}	// Google User ID
	}
);

module.exports = mongoose.model('GoogleUser', GoogleUserSchema);