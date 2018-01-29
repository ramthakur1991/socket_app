var gcm = require('node-gcm') ,
	apns = require("apns"), options, connection, notification ,
	config = require('../config/local');
	
module.exports = {

    androidNotification: function(device_id, templateid, callback) {
        var message = new gcm.Message({
            data: {
                'message': templateid
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
    },

     appleNotification: function(callback) {
        options = {
            passphrase : "123456",
            cert : "DriftDevPush.pem",
            gateway : 'gateway.sandbox.push.apple.com',
            port : 2195,
            debug : true
        };
         
        connection = new apns.Connection(options);
        
        notification = new apns.Notification();
        notification.device = new apns.Device("bd73d30f83877f94d7c96bf83761da339c6d40d674922d2ff91161bb924388f8");
        notification.alert = "Testing... !";
        connection.sendNotification(notification,function (err, response){
            console.log("err, responseerr, response",err, response);
            if (err) {
                callback(true, err);
            } else {
                callback(false, response);
            }
        });
      
    }
};
