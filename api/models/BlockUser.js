var mongoose = require('./connection') ,
	Schema = mongoose.Schema;
	
	
var BlockModel = new Schema({
    isBlocked : {
		type: Boolean ,
		default : false 
	},
	blockedBy : [{ type: Schema.Types.ObjectId, ref: 'User' }] ,
	blockedTo : [{ type: Schema.Types.ObjectId, ref: 'User' }] 
});


module.exports = mongoose.model('BlockUser', BlockModel);