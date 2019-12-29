// Heroku stuff
const PORT = process.env.PORT || 3000;

var createError = require('http-errors');
var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var cors = require('cors');
var app = express();

// mongodb connection
// password
// HYcSPIim2RDZhSod
mongoose.connect(
  //'mongodb://localhost:27017/conference'
  'mongodb+srv://gavinross:HYcSPIim2RDZhSod@cluster0-8jxq0.mongodb.net/conference?retryWrites=true&w=majority'
);

var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use session for tracking loggins
app.use(
  session({
    secret: 'web 2 class',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({
      mongooseConnection: db,
    }),
    cookie: { maxAge: 9000000 },
  })
);

app.use(cors({ credentials: true, origin: 'http://localhost:4200' }));

// make user ID available in templates
app.use(function(req, res, next) {
  res.locals.currentUser = req.session.userId;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('keyboard cat'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
  // maybe add redirect to Login page???
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

//var port = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log('Express server is listening on port ', PORT);
});

module.exports = app;
