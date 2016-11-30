var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HighScore = new Schema({
	name: { type: String, required: true },
    wins : Number
});

var HighScores = mongoose.model('HighScores', HighScore);

module.exports = HighScores;