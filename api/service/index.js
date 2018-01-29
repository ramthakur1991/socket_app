var fs = require('fs') ,
	path = require('path'),
	mongoose = require('../models/connection'),
	gcm = require('node-gcm'), 
	config = require('../../config/local');


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

module.exports = {
	mediaUpload : function(content, callback){
		var mediaBuffer = decodeBase64Image(content.media) ,
		imageName = Math.random().toString(36).slice(2) ,
		fileName = `${imageName}.${mediaBuffer.type}`;
		if(mediaBuffer.status === 500){
			callback({"status":500, "error": mediaBuffer.error},null);	
		}
		
		fs.writeFile(`${path.resolve('./')}/assets/uploads/${fileName}`,mediaBuffer.data, function (error) {
			if(error){
				callback({"status":500, "error": error},null);
			}else{
				callback(null, {"status":200, "image": fileName});
			}
		});
	},
	dbHelper: function(id){
		return new mongoose.Types.ObjectId( id );
	},
	response : function(status, Message, content, type){
		if(type){
			return {
				status : status ,
				responseMessage : Message ,
				error : content
			};
		}else{
			return {
				status : status ,
				responseMessage : Message ,
				data : content
			};
		}
	},
	androidNotification: function(device_id, templateid, callback){
		var message = new gcm.Message({
            data: {
                message: templateid
            }
        });

        // Set up the sender with you API key 
        var sender = new gcm.Sender(config.gcmServerKey);
        var registrationIds = [];
		registrationIds.push(device_id);
		sender.send(message, { registrationTokens: registrationIds }, function (err, response) {
			if (err) {
				callback(true, err);
			} else {
				callback(false, response);
			}
		});
	}
};