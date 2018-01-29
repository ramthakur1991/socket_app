var BlockUser = require('../models/BlockUser'),
	User = require('../models/User'),
	Service = require('../service') ,
	_ = require('lodash') ,
	async = require('async');
	
module.exports = {
	
	blockUser: function(req, res){
		var params = _.pick(req.body, 'blockTo', 'blockBy');
		async
		.parallel([
			(callback)=>{
				User
				.findOne({
					phoneNumber : Number(params.blockTo)
				}).exec((err, user)=>{
					if(err){
						callback({"phoneNumber": params.blockTo, "message": "Invalid Phonenumber.", "err": err}, null);
					}else{
						if(_.isEmpty(user)){
							callback({"phoneNumber": params.blockTo, "message": "Unable to find user ", "err": err}, null);
						}else{
							callback(null, {"phoneNumber": params.blockTo, "message": "User find successfully ", "data": user});
						}
					}
				});
			},
			(callback)=>{
				User
				.findOne({
					phoneNumber : Number(params.blockBy)
				}).exec((err, user)=>{
					if(err){
						callback({"phoneNumber": params.blockBy, "message": "Invalid Phonenumber.", "err": err}, null);
					}else{
						if(_.isEmpty(user)){
							callback({"phoneNumber": params.blockBy, "message": "Unable to find user ", "err": err}, null);
						}else{
							callback(null, {"phoneNumber": params.blockBy, "message": "User find successfully ", "data": user});
						}
					}
				});
			}
		], (err, result)=>{
			if(err){
				return res.status(500).json(Service.response(500,"Error While checking users", err, true));
			}else{
				var obj = new BlockUser();
				obj.isBlocked = true ;
				obj.blockedTo = result[0].data._id ;
				obj.blockedBy = result[1].data._id ;
				obj.save(function(err, isSaved){
					if(err) {
						return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
					}
					return res.status(200).json(Service.response(200,"Recods saved successfully", isSaved, false));
				});
			}
		});
	},
	
	unblockUser: function(req, res){
		var params = _.pick(req.body, 'unblockTo', 'unblockBy');
		console.log(params);
		async
		.parallel([
			(callback)=>{
				User
				.findOne({
					phoneNumber : Number(params.unblockTo)
				}).exec((err, user)=>{
					if(err){
						callback({"phoneNumber": params.unblockTo, "message": "Invalid phoneNumber", "err": err}, null);
					}else{
						if(_.isEmpty(user)){
							callback({"phoneNumber": params.unblockTo, "message": "Unable to find user", "err": err}, null);
						}else{
							callback(null, {"phoneNumber": params.unblockTo, "message": "User find successfully ", "data": user});
						}
					}
				});
			},
			(callback)=>{
				User
				.findOne({
					phoneNumber : Number(params.unblockBy)
				}).exec((err, user)=>{
					if(err){
						callback({"phoneNumber": params.unblockBy, "message": "Invalid phoneNumber", "err": err}, null);
					}else{
						if(_.isEmpty(user)){
							callback({"phoneNumber": params.unblockBy, "message": "Unable to find user ", "err": err}, null);
						}else{
							callback(null, {"phoneNumber": params.unblockBy, "message": "User find successfully ", "data": user});
						}
					}
				});
			}
		], (err, result)=>{
			if(err){
				return res.status(500).json(Service.response(500,"Error While checking users", err, true));
			}else{
				BlockUser
				.findOne({
					blockedTo : result[0].data._id,
					blockedBy : result[1].data._id, 
					isBlocked: true 
				})
				.exec((err, blockUser)=> {
					if(err){
						return res.status(500).json(Service.response(500,"Error While finding block user", err, true));
					}
					
					if(_.isEmpty(blockUser)){
						return res.status(400).json(Service.response(400,"Please block user to unblock.", "Validation Error", true));
					}else{
						var obj = new BlockUser();
						obj.isBlocked = false ;
						obj.blockedTo = result[0].data._id ;
						obj.blockedBy = result[1].data._id ;
						obj.save(function(err, isSaved){
							if(err) {
								return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
							}
							return res.status(200).json(Service.response(200,"Recods updated successfully", isSaved, false));
						});
					}
				});
			}
		});
	}
};