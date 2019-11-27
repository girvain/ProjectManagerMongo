var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Talk = require('../models/talksModel');
var mid = require('../middleware');

/**
 * Send all the talks from the database to be edited/filters etc by the client.
 */
router.get('/talks/all', mid.loggedIn, (req, res, next) => {
    Talk.find({}, (err, talks) => {
        return res.json(talks);
    })
});

/**
 * Get the array of all the talks the client is interested in/registered for.
 */
router.get('/talks/user', mid.loggedIn, async (req, res, next) => {
    await User.find({_id: req.session.userId}, (err, user) => {
        res.json(user[0].talks);
    })
});

/**
 * Send a new array of values to be updated on the server. Ideal for when the user
 * is adding and removing a lot on the client. Should only be sent when the client is
 * finished, i.e with a "save" button etc.
 * NOTE: this will replace the previous array in the user document.
 */
router.post('/talks/save', mid.loggedIn, (req, res, next) => {
    const talks = req.body.talks;
    const userId = req.session.userId;

    User.findByIdAndUpdate({_id: userId },
        {talks: talks},
        (err, result) => {
        return res.json(result);
    });
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

router.post('/talks/remove/:id', mid.loggedIn, (req, res, next) => {
    const talkId = req.params.id;
    const userId = req.session.userId;

    User.findByIdAndUpdate(userId,
        {$pull: {talks: talkId}},
        (err, result) => {
        return res.json(result);
    });
});


module.exports = router;
