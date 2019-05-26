var express = require("express");
var router = express.Router();
var Projects = require("../models/projects");
var User = require("../models/users");
fdadsd
// POST /add-user
router.post("/add-user/:id", (req, res, next) => {
  // if (req.body.email) {
  //   User.findOneAndUpdate({
  //       email: req.body.email
  //     }, {
  //       $addToSet: {
  //         projects: req.params.id
  //       }
  //     },
  //     (error, user) => {
  //       if (error || !user) {
  //         console.log('username not found');
  //         res.redirect(req.get("referer"));

  //       } else {
  //         Projects.findOneAndUpdate({
  //             _id: req.params.id
  //           }, {
  //             $addToSet: {
  //               members: user._id
  //             }
  //           },
  //           (error, success) => {
  //             if (error) {
  //               console.log(error);
  //             } else {
  //               console.log(success);
  //               res.redirect(req.get("referer"));
  //             }
  //           }
  //         );
  //       }
  //     }
  //   );
  // } else {
  //   // implement missing form logic
  //   res.redirect(req.get("referer"));
  // }

  var foundUser = User.findOneAndUpdate({
      email: req.body.email
    }, {
      $addToSet: {
        projects: req.params.id
      }
    },
    (error, user) => {
      if (error || !user) {
        return console.log('username not found');
        //          res.redirect(req.get("referer"));
      }
    }).then(user => {
      return Projects.findOneAndUpdate({
        _id: req.params.id
      }, {
        $addToSet: {
          members: user._id
        }
      },
      (error, success) => {
        if (error) {
          console.log(error);
        } else {
          console.log(user);
          //         res.redirect(req.get("referer"));
        }
      });
    }).finally(() => {
      res.redirect(req.get("referer"));
    });
});

module.exports = router;

