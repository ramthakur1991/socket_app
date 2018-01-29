var mongoose = require('./connection') ,
	Schema = mongoose.Schema;
	
	
var UserModel = new Schema({
    name: {
		type : String,
		lowercase : true ,
		trim : true ,
		required : [true, 'Name field is required.']
	},
	profilePic : {
		type : String ,
		trim: true 
	},
	phoneNumber : {
		type : Number ,
		trim: true ,
		unique: true ,
		index : true 
	},
	deviceId : {
		type : String ,
		trim : true ,
		unique : true 
	},
	deviceType : {
		type: String,
		trim: true,
		enum : ['ios','android']
	}
});


module.exports = mongoose.model('User', UserModel);