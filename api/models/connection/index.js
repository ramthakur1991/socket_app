var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/chatPoc'); // connect to our database

module.exports = mongoose ;