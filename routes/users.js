var express = require('express');
var router = express.Router();
var User = require('../models/users');
var mid = require('../middleware');
// var bcrypt = require("bcryptjs");

// POST /register
router.post('/register', (req, res, next) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'All fields required' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 7) {
    errors.push({ msg: 'Password must be at least 7 characters' });
  }

  if (errors.length > 0) {
    res.json({
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    // All validation passed
    // create object with form input
    var userData = {
      email: email,
      name: name,
      password: password,
    };
    User.create(userData, function(error, user) {
      if (error) {
        errors.push({ msg: 'Email already in use' });
        res.json({
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        req.session.userId = user._id;
        return res.json('successful registering');
      }
    });
  }
});

// POST /login
router.post('/login', function(req, res, next) {
  console.log(req.body);
  const { email, password } = req.body;
  let errors = [];

  if (!email || !password) {
    errors.push({ msg: 'All fields required' });
  }

  if (errors.length > 0) {
    console.log(req.body);
    res.statusCode = 401;
    res.json({
      errors,
      // email,
      // password,
    });
  } else {
    User.authenticate(email, password, function(error, user) {
      if (error || !user) {
        res.statusCode = 401;
        errors.push({ msg: 'Invalid email or password' });
        res.json({
          errors,
          // email,
          // password,
        });
      } else {
        req.session.userId = user._id;
        res.statusCode = 200;
        return res.json('sucessfull login');
      }
    });
  }

  // GET /logout
  router.get('/logout', function(req, res, next) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        //return res.redirect("/");
        res.statusCode = 200;
        console.log('session destroyed');
        return res.json({ msg: 'logged out' });
      }
    });
  });

  // GAVINS LOGIN PROCESS
  // if (req.body.email && req.body.password) {
  //   User.authenticate(req.body.email, req.body.password, function(error, user) {
  //     if (error || !user) {
  //       var err = new Error("Wrong email or password.");
  //       err.status = 401;

  //       res.render("login", { error: err.message });

  //       return next(err);
  //     } else {
  //       req.session.userId = user._id;
  //       return res.redirect("/dashboard");
  //     }
  //   });
  // } else {
  //   var err = new Error("Email and password are required.");
  //   err.status = 401;
  //   res.render("login", { error: err.message });
  //   return next(err);
  // }
});

module.exports = router;
