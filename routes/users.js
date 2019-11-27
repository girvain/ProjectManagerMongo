var express = require('express');
var router = express.Router();
var User = require('../models/users');
var mid = require('../middleware');
// var bcrypt = require("bcryptjs");

// /* GET users listing. */
// router.get("/", function(req, res, next) {
//   // res.send("probably wont be using this page at /users");
//   res.render("index", {
//     title: "Welcome"
//   });
// });

// GET /register
// router.get('/register', function (req, res, next) {
//     res.render('register', {
//         title: 'Register',
//     });
// });

// POST /register
router.post('/register', (req, res, next) => {
    // ROSS' REGISTER PROCESS
    const {name, email, password, password2} = req.body;
    let errors = [];

    if (!name || !email || !password || !password2) {
        errors.push({msg: 'All fields required'});
    }

    if (password != password2) {
        errors.push({msg: 'Passwords do not match'});
    }

    if (password.length < 7) {
        errors.push({msg: 'Password must be at least 7 characters'});
    }

    if (errors.length > 0) {
        res.render('register', {
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
        User.create(userData, function (error, user) {
            if (error) {
                errors.push({msg: 'Email already in use'});
                res.render('register', {
                    errors,
                    name,
                    email,
                    password,
                    password2,
                });
            } else {
                req.session.userId = user._id;
                return res.redirect('/dashboard');
            }
        });
    }
    // GAVINS REGISTER PROCESS
    // if (
    //   req.body.email &&
    //   req.body.name &&
    //   req.body.password &&
    //   req.body.password2
    // ) {
    //   // confirm that user typed same password twice
    //   if (req.body.password !== req.body.password2) {
    //     var err = new Error("Passwords do not match.");
    //     err.status = 400;
    //     return next(err);
    //   }

    //   // create object with form input
    //   var userData = {
    //     email: req.body.email,
    //     name: req.body.name,
    //     password: req.body.password
    //   };

    //   // use schema's `create` method to insert document into Mongo
    //   User.create(userData, function(error, user) {
    //     if (error) {
    //       var err = new Error("Username already exists");
    //       err.status = 400;
    //       res.render("register", { error: err.message });
    //       // return next(error);
    //     } else {
    //       req.session.userId = user._id;
    //       return res.redirect("/dashboard");
    //     }
    //   });
    // } else {
    //   var err = new Error("All fields required.");
    //   err.status = 400;
    //   res.render("register", { error: err.message });
    //   return next(err);
    // }
});

// // GET /login
// router.get('/login', mid.loggedOut, function (req, res, next) {
//     res.render('login', {
//         title: 'Login',
//     });
// });

// POST /login
router.post('/login', function (req, res, next) {
    const {email, password} = req.body;
    let errors = [];

    // ROSS' LOGIN PROCESS
    if (!email || !password) {
        errors.push({msg: 'All fields required'});
    }

    if (errors.length > 0) {
        console.log(req.body);
        res.render('login', {
            errors,
            email,
            password,
        });
    } else {
        User.authenticate(email, password, function (error, user) {
            if (error || !user) {
                errors.push({msg: 'Invalid email or password'});
                res.render('login', {
                    errors,
                    email,
                    password,
                });
            } else {
                req.session.userId = user._id;
                res.statusCode = 200;
                // return res.redirect("/dashboard");
                return res.json('vvvvellcome');
            }
        });
    }
    // GET /logout
    router.get('/logout', function (req, res, next) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                //return res.redirect("/");
                return res.json({msg: 'logged out'});
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