var config = require('./config.json');

var path = require('path');
var express = require('express');
var passport = require('passport');
var flash    = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var secret = require('./app/lib/secret');
var session = require('express-session');
var http = require('http');
var socketio = require('socket.io');
var webSocket = require('./app/websocket/webSocket');
var db = require('./app/lib/sqlPool');
var user = require('./app/models/user');
require('./app/config/passport')(passport);

var app = express();
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'static')));

// TODO: Save a random key in a file for those secret settings
app.set('secretApiKey', 'thisissecret! :o');

app.use(session({
    secret: secret.get('sessionSecret').toString(),
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    next();
});

// Routes
var apiRoutes = require('./app/routes/apiRoutes');
var homeRoutes = require('./app/routes/homeRoutes');
var authRoutes = require('./app/routes/authRoutes');

app.use('/api', apiRoutes());
app.use('/', homeRoutes());
app.use('/auth/', authRoutes());


app.get('/test_sql', function(req, res){
    db.query('SELECT * FROM `test` ', function (error, results) {
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
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

var server = http.Server(app);
var io = socketio(server);
var webSocketServer = webSocket(app, io);

server.listen(config.port, config.hostname, function(){
    var hostname = config.hostname ? config.hostname : '*';
    console.log('listening on ' + hostname + ':' + server.address().port);
});
