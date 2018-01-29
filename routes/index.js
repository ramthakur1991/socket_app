var UserController = require('../api/controller/UserController'),
	GroupController = require('../api/controller/GroupController'),
	GroupUserController = require('../api/controller/GroupUserController'),
	BlockUserController = require('../api/controller/BlockUserController');

module.exports = function(router){

	router.get('/',function(req,res){
		res.render('index');
	});

	router.post('/api/registration', function(req, res){
		return UserController.register(req, res);
	});
	
	router.post('/api/importContacts', function(req, res){
		return UserController.importContacts(req, res);	
	});

	router.get('/api/listGroup/:userId', function(req, res){
		return GroupController.listGroup(req, res);	
	});
	
	router.post('/api/addGroup', function(req, res){
		return GroupController.addGroup(req, res);	
	});
	
	router.post('/api/deleteGroup', function(req, res){
		return GroupController.deleteGroup(req, res);	
	});
	
	router.post('/api/updateGroup', function(req, res){
		return GroupController.updateGroup(req, res);	
	});
	
	router.post('/api/addGroupUsers', function(req, res){
		return GroupUserController.addGroupUsers(req, res);	
	});
	
	router.post('/api/removeGroupUsers', function(req, res){
		return GroupUserController.removeGroupUsers(req, res);	
	});
	
	router.get('/api/listGroupUsers/:groupId', function(req, res){
		return GroupUserController.listGroupUsers(req, res);	
	});
	
	router.post('/api/blockUser', function(req, res){
		return BlockUserController.blockUser(req, res); 
	});
	
	router.post('/api/unblockUser', function(req, res){
		return BlockUserController.unblockUser(req, res); 
	});
	
	router.get('/api/getUserDetailById/:id', function(req, res){
		return UserController.getUserDetails(req, res);
	});
	
	router.post('/api/updateUserProfile', function(req, res){
		return UserController.updateUserProfile(req, res);
	});
};