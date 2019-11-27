var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Projects = require('../models/projects');
var mid = require('../middleware');


router.get('/newhope', mid.loggedIn, (req, res, next) => {
  res.send('Awrite their obe one ya  jake!');
});


module.exports = router;
