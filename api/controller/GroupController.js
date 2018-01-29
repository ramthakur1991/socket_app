var Group = require('../models/Group'),
	Service = require('../service') ,
	_ = require('lodash') ;
	
module.exports = {
	
	listGroup : function(req, res){
		var params = _.pick(req.params, 'userId');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.userId)){
			return res.status(400).json(Service.response(400,"`userId` must be specified to get group list", "Validation Error", true));
		}
		
		Group
		.find({
			adminId : Service.dbHelper(params.userId)
		})
		.exec(function(err, group){
			if(err){
				return res.status(500).json(Service.response(500,"Error While checking group admin", err, true));
			}
			
			if(_.isEmpty(group)){
				return res.status(200).json(Service.response(200,"No group is added by this user.", "No Records", true));
			}else{
				return res.status(200).json(Service.response(200,"Recods fetched successfully", group, false));
			}
		} );
	},
	
	addGroup: function(req, res){
		var params = _.pick(req.body, 'name', 'groupPic', 'adminId');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.name)){
			return res.status(400).json(Service.response(400,"Group name is required", "Validation Error", true));
		}
		
		if(_.isEmpty(params.adminId)){
			return res.status(400).json(Service.response(400,"Group admin is required", "Validation Error", true));
		}
		
		if(_.isEmpty(params.groupPic)){
			var obj = new Group();
				obj.name = params.name ;
				obj.groupPic = `${req.protocol}://${req.headers.host}/profile_pic/group_img.png`;
				obj.adminId = Service.dbHelper(params.adminId) ;
				obj.save(function(err, isSaved){
					if(err) {
						return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
					}
					return res.status(200).json(Service.response(200,"Recods saved successfully", isSaved, false));
				});
		}else{
			params.media = params.groupPic ;
			Service.mediaUpload(params, function(err, content){
				if(err){
					return res.status(err.status).json(Service.response(500,"Error While saving Record", err.error, true));
				}
				var obj = new Group();
				obj.name = params.name ;
				obj.groupPic = `${req.protocol}://${req.headers.host}/uploads/${content.image}` ;
				obj.adminId = Service.dbHelper(params.adminId) ;
				obj.save(function(err, isSaved){
					if(err) {
						return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
					}
					return res.status(200).json(Service.response(200,"Recods saved successfully", isSaved, false));
				});
			});
		}
	},
	
	deleteGroup : function(req, res){
		var params = _.pick(req.body, 'groupId', 'adminId');
		
		if(_.isEmpty(params)){
			return res.status(400).json(Service.response(400,"Reuest body is empty", "Validation Error", true));
		}
		
		if(_.isEmpty(params.groupId)){
			return res.status(400).json(Service.response(400,"Group id is required", "Validation Error", true));
		}
		
		if(_.isEmpty(params.adminId)){
			return res.status(400).json(Service.response(400,"Group admin is required", "Validation Error", true));
		}
		
		Group
		.findOne({
			_id :  Service.dbHelper(params.groupId) ,
			adminId : params.adminId
		})
		.exec(function(err, group){
			if(err){
				return res.status(500).json(Service.response(500,"Error While checking group admin", err, true));
			}
			
			if(_.isEmpty(group)){
				return res.status(403).json(Service.response(403,"You are not authorized to delete the group", "Authorization Error", true));
			}else{
				Group
				.findOneAndUpdate({
					_id :  Service.dbHelper(params.groupId)
				},{
					isDeleted : true	
				}, {
					new: true
				}, function(err, isUpdated){
					if(err) {
						return res.status(500).json(Service.response(500,"Error While removing Record", err, true));
					}
					return res.status(200).json(Service.response(200,"Recods removed successfully", isUpdated, false));
				});
			}
		} );
	},	
	updateGroup: function(req, res){
		var params = _.pick(req.body, '_id', 'name', 'groupPic', 'adminId');
		
		Group
		.findOne({
			_id :  Service.dbHelper(params._id) ,
		})
		.exec(function(err, group){
			if(err){
				return res.status(500).json(Service.response(500,"There is some serverError", err, true));
			}
			
			if(_.isEmpty(group)){
				return res.status(200).json(Service.response(200,"There is no group with this is Id", "No Records", true));
			}else{
				if(_.isEmpty(params.groupPic)){
					var obj = new Group();
						obj.name = params.name || group.name;
						obj.groupPic = params.groupPic || group.groupPic ;
						obj.adminId = Service.dbHelper(params.adminId || group.adminId) ;
						obj.save(function(err, isSaved){
							if(err) {
								return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
							}
							return res.status(200).json(Service.response(200,"Recods updated successfully", isSaved, false));
						});
				}else{
					params.media = params.groupPic ;
					Service.mediaUpload(params, function(err, content){
						if(err){
							return res.status(err.status).json(Service.response(500,"Error While saving Record", err.error, true));
						}
						
						var obj = new Group();
						obj.name = params.name || group.name;
						obj.groupPic = `${req.protocol}://${req.headers.host}/uploads/${content.image}` ;
						obj.adminId = Service.dbHelper(params.adminId || group.adminId) ;
						obj.save(function(err, isSaved){
							if(err) {
								return res.status(500).json(Service.response(500,"Error While saving Record", err, true));
							}
							return res.status(200).json(Service.response(200,"Recods updated successfully", isSaved, false));
						});
					});
				}
			}
		});
	}
};
