var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HighScore = new Schema({
	username: { type: String, required: true },
    wins : Number
});

module.exports = mongoose.model('HighScore', HighScore);