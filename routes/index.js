var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Projects = require('../models/projects');
var mid = require('../middleware');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Welcome'
  });
});

//  GET /dashboard
router.get('/dashboard', mid.loggedIn, (req, res, next) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      User.findById(req.session.userId)
        .then(function(users) {
          var jobQueries = [];
          users.projects.forEach(function(u) {
            jobQueries.push(Projects.findById(u));
          });

          return Promise.all(jobQueries);
        })
        .then(function(listOfJobs) {
          //console.log(listOfJobs);
          return res.render('dashboard', {
            title: 'Dashboard',
            name: user.name,
            projects: listOfJobs
          });
        })
        .catch(function(error) {
          res.status(500).send('one of the queries failed', error);
        });
    }
  }); // end of User.findbyid
});

// GET /logout
router.get('/logout', function(req, res, next) {
  // delete session object
  req.session.destroy(function(err) {
    if (err) {
      return next(err);
    } else {
      return res.redirect('/');
    }
  });
});

module.exports = router;


