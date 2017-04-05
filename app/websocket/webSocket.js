var jwt = require('jsonwebtoken');
var secrets = require('../lib/secret');

module.exports = function (app, socketio) {
    socketio.on('connection', function(socket){

        //delete socket from namespace connected map until they authenticate
        delete socketio.sockets.connected[socket.id];

        var options = {
            secret: secrets.get('apiSecret'),
            timeout: 5000 // 5 seconds to send the authentication message
        };

        // 5 seconds to send the authentication message
        var auth_timeout = setTimeout(function () {
            socket.emit('chat message', 'Not authorized');
            socket.disconnect('unauthorized');
        }, options.timeout);

        socket.on('authenticate', function (data) {
            console.log('Authentication request');
            clearTimeout(auth_timeout);
            jwt.verify(data.token, options.secret, options, function(err, decoded) {
                if (err){
                    socket.emit('bad token', 'Bad token');
                    socket.disconnect('unauthorized');
                }
                if (!err && decoded){
                    //restore temporarily disabled connection
                    socketio.sockets.connected[socket.id] = socket;

                    socket.userId = decoded.id;
                    socket.connectedAt = new Date();

                    // Disconnect listener
                    socket.on('disconnect', function () {
                        console.info('SOCKET [%s] DISCONNECTED', socket.id);
                    });

                    console.info('SOCKET [%s] CONNECTED', socket.id);
                    console.info('USERID: ', socket.userId);
                    socket.emit('authenticated');
                }
            })
        });

        socket.on('chat message', function(msg){
            socket.emit('chat message', msg);
        });
    });
};