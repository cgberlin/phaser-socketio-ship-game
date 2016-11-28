var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var HighScore = new Schema({
    username: String,
    wins : Number,
    losses : Number
});

module.exports = mongoose.model('HighScore', HighScore);