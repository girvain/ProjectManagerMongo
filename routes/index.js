var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Talk = require('../models/talksModel');
var mid = require('../middleware');


router.get('/newhope', mid.loggedIn, (req, res, next) => {
    return res.json('Awrite their obe one ya  jake!');
});

router.get('/talks', mid.loggedIn, (req, res, next) => {
    Talk.find({}, (err, talks) => {
        return res.json(talks);
    })
});

router.post('/talks/rate/:id', mid.loggedIn, (req, res, next) => {
    const id = req.params.id;
    const rating = {
        userId: req.session.userId,
        rating: req.body.rating
    };
    Talk.update({id: id, 'ratings.userId': {$ne: rating.userId}},
        {$addToSet: {ratings: rating}},
        (err, result) => {
        return res.json(result);
    });
});

/**
 * Add a talk to the users document. It will not add any duplicate ID's but there needs
 * to be logic on the client to prevent clashing of time lines for talks and for boundry data.
 */
router.post('/talks/add/:id', mid.loggedIn, (req, res, next) => {
    const talkId = req.params.id;
    const userId = req.session.userId;

    User.update({_id: userId, 'talks': {$ne: talkId}},
        {$push: {talks: talkId}},
        (err, result) => {
        return res.json(result);
    });
});


module.exports = router;
