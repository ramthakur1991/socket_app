var User = require('../models/User'),
	Service = require('../service') ,
	_ = require('lodash') ;
	//async = require('async');
	
module.exports = {
	register : function(req, res){
		var params = _.pick(req.body, 'name', 'profilePic', 'phoneNumber', 'deviceId', 'deviceType');
		User
		.find({
			phoneNumber: params.phoneNumber
		})
		.exec(function(err, user){
			if(err) {
				return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
			}
			if(_.isEmpty(user)){
				if(_.isEmpty(params.profilePic)){
					var obj = new User();
					obj.name = params.name ;
					obj.profilePic = `${req.protocol}://${req.headers.host}/profile_pic/profile_pic.png` ;
					obj.phoneNumber = params.phoneNumber;
					obj.deviceId = params.deviceId;
					obj.deviceType = params.deviceType;
					
					obj.save(function(err, isSaved){
						console.log(err, isSaved);
						if(err) {
							return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
						}
						return res.status(200).json(Service.response(200,"Recods saved successfully", isSaved, false));
					});
				}else{
					params.media = params.profilePic ;
					Service.mediaUpload(params, function(err, content){
						if(err){
							return res.status(err.status).json(Service.response(500,"Error While saving Record", err.error, true));
						}
						var obj = new User();
						obj.name = params.name ;
						obj.profilePic = `${req.protocol}://${req.headers.host}/uploads/${content.image}` ;
						obj.phoneNumber = params.phoneNumber;
						obj.deviceId = params.deviceId;
						obj.deviceType = params.deviceType;
						
						obj.save(function(err, isSaved){
							if(err) {
								return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
							}
							return res.status(200).json(Service.response(200,"Recods saved successfully", isSaved, false));
						});
					});
				}
			}else{
				if(params.profilePic){
					params.media = params.profilePic ;
					Service.mediaUpload(params, function(err, content){
						User
						.findOneAndUpdate({
							phoneNumber :  params.phoneNumber
						},{
							name : params.name ,
							profilePic : `${req.protocol}://${req.headers.host}/uploads/${content.image}` ,
							deviceId : params.deviceId ,
							deviceType : params.deviceType 
						}, {
							new: true
						}, function(err, isUpdated){
							if(err) {
								return res.status(500).json(Service.response(500,"Error While removing Record", err, true));
							}
							return res.status(200).json(Service.response(200,"Recods saved successfully", isUpdated, false));
						});
					});
				}else{
					User
					.findOneAndUpdate({
						phoneNumber :  params.phoneNumber
					},{
						name : params.name ,
						profilePic : `${req.protocol}://${req.headers.host}/profile_pic/profile_pic.png` ,
						deviceId : params.deviceId ,
						deviceType : params.deviceType 
					}, {
						new: true
					}, function(err, isUpdated){
						if(err) {
							return res.status(500).json(Service.response(500,"Error While removing Record", err, true));
						}
						return res.status(200).json(Service.response(200,"Recods saved successfully", isUpdated, false));
					});
				}
			}
		});
	},
	
	importContacts : function(req, res){
		var params = _.pick(req.body, 'contacts');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Please check contact array before request", "Validation Error", true));
		}
		User.find({
			phoneNumber : {
				$in : params.contacts
			}
		})
		.select({'profilePic' : 1 , 'phoneNumber' : 1, 'name' : 1})
		.exec(function(err, user){
			console.log(err, user);
			if(err){
				return res.status(500).json(Service.response(500,"Error While import contacts", err, true));
			}
			return res.status(200).json(Service.response(200,"Import contacts successfully", user, false));
		});
	},
	
	getUserDetails: function(req, res){
		var params = _.pick(req.params, 'id');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Empty url params not going to treated", "Validation Error", true));
		}
		
		if(_.isEmpty(params.id)){
			return res.status(400).json(Service.response(400,"Please check userId params", "Validation Error", true));
		}
		
		User
		.findOne({
			_id: params.id
		})
		.exec(function(err, user){
			if(err){
				return res.status(500).json(Service.response(500,"Error While import contacts", err, true));
			}
			return res.status(200).json(Service.response(200,"User details fetched successfully", user, false));
		});
	},
	
	updateUserProfile : function(req, res){
		var params = _.pick(req.body, 'name', 'profilePic', 'phoneNumber');
		
		if(params.profilePic){
			params.media = params.profilePic ;
			Service.mediaUpload(params, function(err, content){
				User
				.findOneAndUpdate({
					phoneNumber :  params.phoneNumber
				},{
					name : params.name ,
					profilePic : `${req.protocol}://${req.headers.host}/uploads/${content.image}` 
				}, {
					new: true
				}, function(err, isUpdated){
					if(err) {
						return res.status(500).json(Service.response(500,"Error While removing Record", err, true));
					}
					return res.status(200).json(Service.response(200,"Recods updated successfully", isUpdated, false));
				});
			});
		}else{
			User
			.findOneAndUpdate({
				phoneNumber :  params.phoneNumber
			},{
				name : params.name ,
			}, {
				new: true
			}, function(err, isUpdated){
				if(err) {
					return res.status(500).json(Service.response(500,"Error While removing Record", err, true));
				}
				return res.status(200).json(Service.response(200,"Recods updated successfully", isUpdated, false));
			});
		}
	}
	
};
