var config = require('./config.json');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mysql = require('mysql');
var pool = mysql.createPool(config.mysqlSettings);

var webRoot = __dirname + '/www/';

app.get('/', function(req, res){
    res.sendFile(webRoot + 'index.html');
});
app.get('/test_sql', function(req, res){
    pool.query('SELECT * FROM `test` ', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
        console.log('The solution is: ', results[0].solution);
    });
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

http.listen(config.port, config.hostname, function(){
    var hostname = config.hostname ? config.hostname : '*';
    console.log('listening on ' + hostname + ':' + http.address().port);
});
