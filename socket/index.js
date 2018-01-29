var config = require('../config/local'),
	User = require('../api/models/User'),
	GroupUsers = require('../api/models/GroupUsers'),
	Group = require('../api/models/Group'),
	_ = require('lodash') ,
	Service = require('../api/service'),
	fs = require('fs') ,
	path = require('path'),
	NotificationService = require('./pushNotificationService');
	
module.exports = function(io){
	var connectedSocket = {} ;
	
	io.on('connection', function(socket){

		socket.on('init', function(userId) {
			if(connectedSocket[userId]){
				console.log("User is already connected with SocketId ....", userId);
			}else{
				socket.userId = userId;
				connectedSocket[userId] = socket;
				console.log("User is going to connect with SocketId ....", userId);
				socket.broadcast.emit('onlineUser', {'id':userId});
			}
		});
		
		socket.on('message', function(data){
			if(data.isPrivate){
				singleChatMessages(data, connectedSocket);	
			}else{
				groupChatMessages(data, connectedSocket);
			}
		});
		
		socket.on('typingEvent', function(data){
			socket.broadcast.emit('typingEvent', data);
		});
		
		socket.on('userStopTyping', function(data){
			socket.broadcast.emit('userStopTyping', data);
		});
		
		socket.on('isUserStatus', function(user_id){
			if(connectedSocket[user_id]){
				socket.emit('isUserStatus', {'status':'online'});
			}else{
				socket.emit('isUserStatus', {'status':'offline'});
			}
		});
		
		socket.on('offline', function (userId) {
			console.log("User is going to offline with the SocketId ....", userId);
			socket.broadcast.emit('offlineUser', {'id':userId});
			delete connectedSocket[userId];
		});
	});
};

function singleChatMessages(data, connectedSocket) {
	if (data.isMedia) {
		getUserDetails(data.userId, function(err, toUser){
			mediaUpload(data, function(result){
				console.log("Result is as folows >>>", result);
				if(result.status === 200){
					if(connectedSocket[data.userTo]){
						data.message = `${config.mediaUrl}/socketUploads/${result.image}`;
						data.typeMessage = "private" ;
						data.profilePic = toUser.profilePic ;
						connectedSocket[data.userTo].emit('message',data);	
					}else{
						getUserDetails(data.userTo, (err, user)=>{
							if(err) console.log(err);
							if(user){
								data.message = `${config.mediaUrl}/socketUploads/${result.image}`;
								data.typeMessage = "private" ;
								data.profilePic = toUser.profilePic ;
								NotificationService.androidNotification(user.deviceId, data, function(err) {
									console.log("Error while sending push notification", err);
								});  
							}
						});
					}
				}
			});
		});
	} else {
		getUserDetails(data.userId, function(err, user){
			if(connectedSocket[data.userTo]){
				data.typeMessage = 'private' ;
				data.profilePic = user.profilePic ;
				connectedSocket[data.userTo].emit('message', data);
				console.log("Message has been emmit", data);
			}else{
				console.log("Comes not case ....");
				User
				.findOne({
					_id: Service.dbHelper(data.userTo)
				})
				.exec(function(err, toUser){
					if(user){
						data.typeMessage = "private" ;
						data.profilePic = user.profilePic ;
						NotificationService.androidNotification(toUser.deviceId, data, function(err, res) {
							console.log("Error while sending push notification", err);
							console.log("Notification send succesfully",res);
						});  
					}
				});
			}
		});
	}
}

function groupChatMessages(data, connectedSocket){
	if(data.isMedia){
		GroupUsers
		.find({
			groupId : data.userTo ,
			isblocked : false ,
			isDeleted : false 
		})
		.exec((err, users)=>{
			if(err){
				console.log("Execption raised in media true case >>>", err);
			}
			_.map(users, (obj)=>{
				if(data.userId.toString() !== obj.user[0].toString()){
					if(connectedSocket[obj.user[0]]){
						getGroupDetail(obj.groupId[0], function(err, group){
							getUserDetails(data.userId, function(err, userRecords){
								mediaUpload(data, function(result){
									if(result.status === 200){
										if(!group.isDeleted){
											data.message = `${config.mediaUrl}/socketUploads/${result.image}`;
											data.groupId = data.userTo || obj.groupId[0] ;
											data.typeMessage = "group" ;
											data.profilePic = group.groupPic ;
											data.fromuser = userRecords.name ;
											delete data.userTo ;
											delete data.userId ;
											connectedSocket[obj.user[0]].emit('groupMsg', data);
										}
									}
								});
							});
						});
					}else{
						getGroupDetail(obj.groupId[0], function(err, group){
							getUserDetails(obj.user[0], function(err, user){
								getUserDetails(data.userId, function(err, sender){
									mediaUpload(data, function(result){
										if(result.status === 200){
											if(!group.isDeleted){
												data.groupId = data.userTo || obj.groupId[0] ;
												data.typeMessage = "group" ;
												data.profilePic = group.groupPic ;
												data.fromuser = sender.name ;
												data.message = `${config.mediaUrl}/socketUploads/${result.image}`;
												delete data.userTo ;
												delete data.userId ;
												NotificationService.androidNotification(user.deviceId, data, function(err, res) {
													if(err) console.log("Error while sending push notification", err);
													if(res) console.log("Notification send successfully in group", res);
												});
											}
										}
									});
								});
							});
						});
					}
				}
			});
		});
	}else{
		GroupUsers
		.find({
			groupId : data.userTo ,
			isblocked : false ,
			isDeleted : false 
		})
		.exec((err, users)=>{
			if(err){
				console.log("Execption raised in media else case >>>", err);
			}
			
			_.map(users, function(obj){
				if(data.userId.toString() !== obj.user[0].toString()){
					if( connectedSocket[obj.user[0]] ){
						getGroupDetail(obj.groupId[0], function(err, group){
							getUserDetails(data.userId, function(err, userRecords){
								if(!group.isDeleted){
									data.groupId = data.userTo || obj.groupId[0] ;
									data.typeMessage = "group" ;
									data.profilePic = group.groupPic ;
									data.fromuser = userRecords.name;
									delete data.userTo ;
									delete data.userId ;
									connectedSocket[obj.user[0]].emit('groupMsg', data);
								}
							});
						});
					}else{
						getGroupDetail(obj.groupId[0], function(err, group){
							getUserDetails(obj.user[0], function(err, user){
								getUserDetails(data.userId, function(err, sender){
									if(!group.isDeleted){
										data.groupId = data.userTo || obj.groupId[0] ;
										data.typeMessage = "group" ;
										data.profilePic = group.groupPic ;
										data.fromuser  = sender.name ;
										delete data.userTo ;
										delete data.userId ;
										NotificationService.androidNotification(user.deviceId, data, function(err, res) {
											if(err) console.log("Error while sending push notification", err);
											if(res) console.log("Notification send successfully", res);
										}); 
									}
								});
							});
						});
					}
				}
			});
		});
	}
}

function getUserDetails(id, callback){
	User
	.findOne({
		_id: id
	})
	.exec(function(err, user){
		if (err) callback(err, null);
		if(user) callback (null, user) ;
	});
}

function getGroupDetail(id, callback){
	Group
	.findOne({
		_id: id
	})
	.exec(function(err, user){
		if (err) callback(err, null);
		if(user) callback (null, user) ;
	});
}

function mediaUpload(content, callback){
	var mediaBuffer = decodeBase64Image(content.message) ,
	imageName = Math.random().toString(36).slice(2) ,
	fileName = `${imageName}.${mediaBuffer.type}`;
	if(mediaBuffer.status === 500){
		callback({"status":500, "error": mediaBuffer.error},null);	
	}
	
	fs.writeFile(`${path.resolve('./')}/assets/socketUploads/${fileName}`,mediaBuffer.data, function (error) {
		if(error){
			callback({"status":500, "error": error});
		}else{
			callback({"status":200, "image": fileName});
		}
	});
}

function decodeBase64Image(dataString) {
	var matchArray = dataString.trim().match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
		response = {};
	if (matchArray.length !== 3) {
		return {"status":500, "error": "Invalid base64 content to upload media"} ;
	}
	response.status = 200 ;
	response.type = matchArray[1].split('/')[1];
	response.data = new Buffer(matchArray[2], 'base64');
	return response;
}