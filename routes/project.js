const express = require("express");
const router = express.Router();
const User = require("../models/users");
const Projects = require("../models/projects");
const mid = require("../middleware");

// PROJECT ROUTES

// POST /create project
router.post("/create", (req, res, next) => {
  errors = [];
  if (req.body.name == "" || req.body.description == "") {
    errors.push({
      msg: "All fields required"
    });
  }

  let project = new Projects({
    name: req.body.name,
    description: req.body.description,
    members: req.session.userId
  });

  if (errors.length > 0) {
    res.render("project-form", {
      errors,
      name,
      description
    });
  } else {
    Projects.create(project, function(error, data) {
      if (error) {
        console.log(error);
        return next(error);
      } else {
        // Update the current user's projects with the newly created one's ID
        User.findOneAndUpdate({
            _id: req.session.userId
          }, {
            $push: {
              projects: data._id
            }
          },
          (error, success) => {
            if (error) {
              console.log(error);
            } else {
              console.log(success);
            }
          }
        );
        return res.redirect("/dashboard");
      }
    });
  }
});


// GET /edit project
router.get("/edit/:id", (req, res, next) => {
  Projects.findById(req.params.id, (err, project) => {
    res.render("project-form", {
      title: "Edit Project",
      project: project,
      button: "Update"
    });
  });
});

// POST /edit project
router.post("/edit/:id", (req, res, next) => {
  const {
    name,
    description
  } = req.body;
  let errors = [];
  // Check for blank inputs
  if (!name || !description) {
    errors.push({
      msg: "All fields required"
    });
  }

  // Check if errors
  if (errors.length > 0) {
    Projects.findById(req.params.id, (err, project) => {
      if (err) throw err;
      let milestones = project.milestones;

      let newProject = new Projects({
        name: name,
        description: description,
        milestones: milestones,
        _id: req.params.id
      });
      // Re-render edit form with inputs and errors
      res.render("project-form", {
        errors,
        project: newProject,
        button: "Update"
      });
    });
  } else {
    // update existing project with the new project details, this is nessessary to get the milestones
    Projects.findById(req.params.id, (err, project) => {
        if (err) throw err;
      })
      .then(result => {
        let newProject = new Projects({
          name: name,
          description: description,
          milestones: result.milestones, // take the milestones from the findById query result
          _id: req.params.id
        });

        Projects.findByIdAndUpdate(req.params.id, newProject, {}, err => {
          if (err) {
            return next(err);
          }
          res.redirect("/dashboard");
        });

      });
  }
});

// POST /delete-project
// NOTE: this deletes the whole project from database, so it removes it from all users linked to it
// router.post("/delete/:id", (req, res, next) => {
//     Projects.findByIdAndDelete({ _id: req.params.id }, (err, success) => {
//         if (err) {
//             next(err);
//         } else {
//             res.redirect("/dashboard");
//         }
//     });
// });

/**
 * Alternate delete that only deletes the project and user ids
 */
// router.post("/delete/:id", (req, res, next) => {
//   Projects.findByIdAndUpdate(
//     req.params.id,
//     {
//       $pull: {
//         members: req.session.userId
//       }
//     },
//     function(err, model) {
//       if (err) {
//         console.log(err);
//         return res.send(err);
//       } else {
//         User.findByIdAndUpdate(
//           req.session.userId,
//           {
//             $pull: {
//               projects: req.params.id
//             }
//           },
//           function(err, model) {
//             if (err) {
//               console.log(err);
//               return res.send(err);
//             } else {
//               // implement missing form logic
//               // res.redirect(req.get("referer"));
//             }
//           }
//         );
//         res.redirect(req.get("referer"));
//       }
//     }
//   );
// });

// async delete method using promise.all() to ensure that all the db queries have
// executed before redirecting
router.post('/delete/:id', (req, res, next) => {

  Promise.all([
      Projects.findByIdAndUpdate(
        req.params.id, {
          $pull: {
            members: req.session.userId
          }
        },
        function(err, model) {
          return model;
        }
      ),
      User.findByIdAndUpdate(
        req.session.userId, {
          $pull: {
            projects: req.params.id
          }
        },
        function(err, model) {
          if (err) {
            console.log(err);
            return res.send(err);
          } else {
            // implement missing form logic
            // res.redirect(req.get('referer'));
          }
        }
      )
    ])
    .then(() => {
      res.redirect(req.get('referer'));
    })
    .catch(err => {
      return next(err);
    });
});


// TASK ROUTES

//  GET /project task list
router.get('/:id', mid.loggedIn, (req, res, next) => {
  User.findById(req.session.userId).exec((error, user) => {
    if (error) {
      return next(error);
    } else {
      Projects.findById(req.params.id).then(project => {
        //console.log(project);
        res.render('project', {
          title: 'project',
          projectID: project._id,
          name: user.name,
          projectName: project.name,
          description: project.description,
          milestones: project.milestones
        });
      });
    }
  }); // end of User.findbyid
});


router.get('/:id', mid.loggedIn, (req, res, next) => {
  User.findById(req.session.userId).exec((error, whyIsThisHere) => {
    if (error) {
      return next(error);
    }
  })
    .then(user => {
      Projects.findById(req.params.id, project => {
        res.render('project', {
          title: 'project',
          projectID: project._id,
          name: user.name,
          projectName: project.name,
          description: project.description,
          milestones: project.milestones
        });
      });
    })
    .catch(err => {
      return next(err);
    });
});

// POST /new-task
router.post('/:id/task/new', (req, res, next) => {
  if (req.body.title && req.body.description && req.body.due_date) {
    Projects.findById({
      _id: req.params.id
    }).then(project => {
      project.milestones.push({
        title: req.body.title,
        description: req.body.description,
        due_date: req.body.due_date
      });
      project.save();
      res.redirect(req.get('referer'));
    });
  } else {
    // implement missing form logic
    res.redirect(req.get('referer'));
  }
});

// GET /edit-task form
router.get('/:id/edit/:milestoneId', (req, res, next) => {
  Projects.findById({
    _id: req.params.id
  }).then(project => {
    let milestone = project.milestones.id(req.params.milestoneId);
    res.render('task-form', {
      title: 'Edit Task',
      task: milestone,
      button: 'Update'
    });
  });
});

// POST /edit-task
router.post('/:id/edit/:milestoneId', (req, res, next) => {
  if (req.body.title && req.body.description && req.body.due_date) {
    Projects.findById({
      _id: req.params.id
    }).then(project => {
      let milestone = project.milestones.id(req.params.milestoneId);
      milestone.title = req.body.title;
      milestone.description = req.body.description;
      milestone.due_date = req.body.due_date;
      project.save();
      res.redirect('/project/' + req.params.id);
    });
  } else {
    // implement missing form logic
    res.redirect(req.get('referer'));
  }
});

// Post /complete-task
router.post('/:id/complete-task/:milestoneId', (req, res, next) => {
  if (req.body.completionDate) {
    Projects.findById({
      _id: req.params.id
    }).then(project => {
      // console.log(project.milestones.id(req.params.task));
      let milestone = project.milestones.id(req.params.milestoneId);
      milestone.completeDate = req.body.completionDate;
      project.save();
      res.redirect(req.get('referer'));
    });
  } else {
    // implement missing form logic
    res.redirect(req.get('referer'));
  }
});

// POST /delete-task
router.post('/:id/delete-task/:milestoneId', (req, res, next) => {
  Projects.findByIdAndUpdate(
    req.params.id, {
      $pull: {
        milestones: {
          _id: req.params.milestoneId
        }
      }
    },
    function(err, model) {
      if (err) {
        console.log(err);
        return res.send(err);
      } else {
        // implement missing form logic
        res.redirect(req.get('referer'));
      }
    }
  );
});

// Get /view-task
router.get('/:id/view/:milestoneId', (req, res, next) => {
  Projects.findById({
    _id: req.params.id
  }).then(project => {
    let milestone = project.milestones.id(req.params.milestoneId);
    let title = milestone.title;
    res.render('task', {
      title: title,
      milestone
    });
  });
});

module.exports = router;
