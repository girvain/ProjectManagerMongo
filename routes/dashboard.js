var express = require('express');
var router = express.Router();
var Projects = require('../models/projects');
var User = require('../models/users');

// POST /add-user
router.post('/add-user/:id', (req, res, next) => {
  User.findOneAndUpdate({
    email: req.body.email
  }, {
    $addToSet: {
      projects: req.params.id
    }
  }, (error, user) => {
    if (error || !user) {
      console.log('username not found');
      return error;
      //          res.redirect(req.get('referer'));
    }
  }).then(user => {
    Projects.findOneAndUpdate({
      _id: req.params.id
    }, {
      $addToSet: {
        members: user._id
      }
    }, (error, success) => {
      if (error) {
        console.log(error);
        return error;
      } else {
        console.log(user);
        return user;
        //         res.redirect(req.get('referer'));
      }
    });
  }).finally(() => {
    res.redirect(req.get('referer'));
  });
});

module.exports = router;
