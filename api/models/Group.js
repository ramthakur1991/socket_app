var mongoose = require('./connection') ,
	Schema = mongoose.Schema;
	
	
var GroupModel = new Schema({
    name: {
		type : String,
		lowercase : true ,
		trim : true ,
		required : [true, 'Group name field is required.']
	},
	groupPic : {
		type : String ,
		trim: true 
	},
	isDeleted : {
		type: Boolean,
		default : false 
	},
	adminId : [{ type: Schema.Types.ObjectId, ref: 'User' }]
});


module.exports = mongoose.model('Group', GroupModel);