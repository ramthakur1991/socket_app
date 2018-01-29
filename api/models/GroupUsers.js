var mongoose = require('./connection') ,
	Schema = mongoose.Schema;
	
	
var GroupUsersModel = new Schema({
    groupId : [{ type: Schema.Types.ObjectId, ref: 'Group' }] ,
	user : [{ type: Schema.Types.ObjectId, ref: 'User' }] ,
	phoneNumber : {
		type: Number,
		trim : true ,
		require : [true, 'Phone number must require']
	},
	isblocked: {
		type: Boolean,
		default: false 
	},
	isDeleted: {
		type: Boolean,
		default: false 
	}
});


module.exports = mongoose.model('GroupUsers', GroupUsersModel);