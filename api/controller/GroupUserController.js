var GroupUsers = require('../models/GroupUsers'),
	Group = require('../models/Group'),
	User = require('../models/User'),
	Service = require('../service') ,
	_ = require('lodash') ;
	async = require('async');
	
module.exports = {
	
	addGroupUsers: function(req, res){
		var params = _.pick(req.body, 'adminId', 'groupId', 'users');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.adminId)){
			return res.status(400).json(Service.response(400,"`adminId` must be specified", "Validation Error", true));
		}
		
		if(_.isEmpty(params.groupId)){
			return res.status(400).json(Service.response(400,"`groupId` must be specified", "Validation Error", true));
		}
		
		if(_.isEmpty(params.users)){
			return res.status(400).json(Service.response(400,"Need users to add into group", "Validation Error", true));
		}else{
			console.log("params.users", params.users);
			Group
			.findOne({
				_id :  Service.dbHelper(params.groupId) ,
				adminId : Service.dbHelper(params.adminId)
			})
			.exec(function(err, group){
				if(err){
					return res.status(500).json(Service.response(500,"Error While checking group admin", err, true));
				}
				
				if(_.isEmpty(group)){
					return res.status(403).json(Service.response(403,"You are not authorized to add user in group", "Authorization Error", true));
				}else{
					async
					.mapSeries(
						params.users,
						function(user, callback){
							GroupUsers
							.findOne({
								groupId : params.groupId,
								phoneNumber : user
							})
							.exec(function(err, record){
								console.log("while finding groupUsers", err,record);
								
								if(err){
									callback({"phoneNumber": user, "message": "Error while finding result users in groupusre"}, null);
								}
								
								if(_.isEmpty(record)){
									User
									.findOne({
										phoneNumber : Number(user)
									})
									.exec(function(err, userRecord){
										if(err){
											callback({"phoneNumber": user, "message": "Error while finding users "}, null);
										}
										
										if(_.isEmpty(userRecord)){
											callback({"phoneNumber": userRecord.phoneNumber, "message": "User is not registred to add into this group", "data": userRecord}, null);
										}else{
											var obj = new GroupUsers();
											obj.groupId = Service.dbHelper(params.groupId);
											obj.user = userRecord._id;
											obj.phoneNumber = userRecord.phoneNumber ;
											obj.isDeleted = false ;
											obj.save(function(err, isSaved){
												if(err) {
													callback({"phoneNumber": userRecord.phoneNumber, "message": "Error while saving users in groupusre", "error": err}, null);
												}else{
													if(userRecord._id.toString() !== params.adminId.toString()){
														var data = {
															message: 'You are added in a group.',
															isMedia: false,
															isPrivate: false,
															userName: group.name,
															groupId: params.groupId,
															typeMessage: 'group',
															profilePic: group.groupPic,
															fromuser: 'admin'
														};
														Service.androidNotification(userRecord.deviceId, data, (err, result)=>{
															if(err) console.log("Exception raised while sending push notification while adding user", err);
															console.log("Notification Status to New User", result);
															callback(null, {"phoneNumber": userRecord.phoneNumber, "message": "user added successfully", "data": isSaved});	
														});
													}else{
														callback(null, {"phoneNumber": user, "message": "In case of Admin user no need to send notification", "data": isSaved});
													}
												}
											});
										}
									});
								}else{
									User
									.findOne({
										phoneNumber : Number(user)
									})
									.exec(function(err, userRecord){
										GroupUsers
										.findOneAndUpdate({
											groupId : Service.dbHelper(params.groupId) ,
											phoneNumber : Number(user)
										},{
											isDeleted : false	
										}, {
											new: true
										}, function(err, isDeleted){
											if(err) {
												callback({"phoneNumber": user, "message": "Error while saving users in groupusre", "error": err}, null);
											}else{
												if(userRecord._id.toString() !== params.adminId.toString()){
													var data = {
														message: 'You are added in a group.',
														isMedia: false,
														isPrivate: false,
														userName: group.name,
														groupId: params.groupId,
														typeMessage: 'group',
														profilePic: group.groupPic,
														fromuser: 'admin'
													};
													Service.androidNotification(userRecord.deviceId, data, (err, result)=>{
														if(err) console.log("Exception raised while sending push notification while adding user", err);
														console.log("Notification Status to existing User", result);
														callback(null, {"phoneNumber": user, "message": "User added successfully", "data": isDeleted});
													});
												}else{
													callback(null, {"phoneNumber": user, "message": "In case of Admin user no need to send notification", "data": isDeleted});
												}
											}
										});
									});
								}
							});
						},
						function(err, addUsers){
							if(err){
								return res.status(500).json(Service.response(500,"Recods added successfully", {"error": err, "success": addUsers}, false));
							}else{
								return res.status(200).json(Service.response(200,"Recods added successfully", {"error": err, "success": addUsers}, false));
							}
						}
					);
				}
			});
		}
	},
	
	removeGroupUsers: function(req, res){
		var params = _.pick(req.body, 'adminId', 'groupId', 'users');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.adminId)){
			return res.status(400).json(Service.response(400,"`adminId` must be specified", "Validation Error", true));
		}
		
		if(_.isEmpty(params.groupId)){
			return res.status(400).json(Service.response(400,"`groupId` must be specified", "Validation Error", true));
		}
		
		if(_.isEmpty(params.users)){
			return res.status(400).json(Service.response(400,"Need users to add into group", "Validation Error", true));
		}else{
			Group
			.findOne({
				_id :  Service.dbHelper(params.groupId) ,
				adminId : Service.dbHelper(params.adminId)
			})
			.exec(function(err, group){
				if(err){
					return res.status(500).json(Service.response(500,"Error While checking group admin", err, true));
				}
				
				if(_.isEmpty(group)){
					return res.status(403).json(Service.response(403,"You are not authorized to remove user from group", "Authorization Error", true));
				}else{
					async
					.mapSeries(
						params.users,
						function(user, callback){
							GroupUsers
							.findOneAndUpdate({
								groupId : params.groupId ,
								phoneNumber : Number(user)
							},{
								isDeleted : true	
							}, {
								new: true
							}, function(err, isDeleted){
								console.log("err, isDeleted", err, isDeleted);
								if(err) {
									callback({"phoneNumber": user, "message": "Error while saving users in groupusre", "error": err}, null);
								}else{
									callback(null, {"phoneNumber": user, "message": "User deleted successfully", "data": isDeleted});
								}
							});
						},
						function(err, addUsers){
							if(err){
								return res.status(500).json(Service.response(200,"Recods deleted successfully", {"error": err, "success": addUsers}, false));
							}else{
								return res.status(200).json(Service.response(200,"Recods deleted successfully", {"error": err, "success": addUsers}, false));
							}
							
						}
					);
				}
			});
		}
	},
	
	listGroupUsers: function(req, res){
		var params = _.pick(req.params, 'groupId');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.groupId)){
			return res.status(400).json(Service.response(400,"`groupId` must be specified", "Validation Error", true));
		}

		GroupUsers
		.find({
			groupId : Service.dbHelper(params.groupId) ,
			isDeleted : false 
		})
		.populate('groupId')
		.populate('user')
		.exec(function(err, groupUsers){
			console.log(err, groupUsers);
			if(err){
				return res.status(500).json(Service.response(500, "Error While fetching group users data", err, true));
			}else{
				return res.status(200).json(Service.response(200, "Recods fetched successfully", {"error": err, "success": groupUsers}, false));
			}
		});
	}
};