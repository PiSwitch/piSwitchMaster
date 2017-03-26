var config = require('./config.json');
var path = require('path');
var logger = require('morgan');
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var mysql = require('mysql');
var pool = mysql.createPool(config.mysql);

var app = express();
var server = http.Server(app);
io = socketio(server);

app.use(express.static(path.join(__dirname, 'static')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));

app.get('/', function(req, res){
    res.render('index')
});
app.get('/test_sql', function(req, res){
    pool.query('SELECT * FROM `test` ', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
    });
});


// 404
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Server errors
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

io.on('connection', function(socket){
    console.log('a user connected');

    socket.on('chat message', function(msg){
        io.emit('chat message', msg);
    });
});

server.listen(config.port, config.hostname, function(){
    var hostname = config.hostname ? config.hostname : '*';
    console.log('listening on ' + hostname + ':' + server.address().port);
});
