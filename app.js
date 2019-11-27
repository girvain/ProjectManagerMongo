var createError = require('http-errors');
var express = require('express');
var path = require('path');

var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dashRouter = require('./routes/dashboard');
var projectRouter = require('./routes/project');

var cors = require('cors');
var app = express();

// mongodb connection
mongoose.connect(
  //  'mongodb+srv://ross-crawford:L6RZipd2YEkS1o3J@defaultcluster-qldkn.mongodb.net/projectManager?retryWrites=true',
  // { useNewUrlParser: true }
//  'mongodb+srv://gavin:F9hcDb4vX!PWk-T@cluster1-blsjo.gcp.mongodb.net/users?retryWrites=true'
  'mongodb://localhost:27017/projectmanager'
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
      mongooseConnection: db
    })
    // cookie: { maxAge: 600000 }
  })
);

app.use(cors());

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
app.use('/dashboard', dashRouter);
app.use('/project', projectRouter);

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

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;