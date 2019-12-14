var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Talk = require('../models/talksModel');
var mid = require('../middleware');

/**
 * Send all the talks from the database to be edited/filters etc by the client.
 */
router.get('/talks/all', (req, res, next) => {
  Talk.find({}, (err, talks) => {
    if (err) return next(err);
    return res.json(talks);
  });
});

/**
 * Get the array of all the talks the client is interested in/registered for.
 */
router.get('/talks/user', mid.loggedIn, (req, res, next) => {
  console.log(req.session.userId);
  User.find({ _id: req.session.userId }, (err, user) => {
    if (err) return next(err);
    res.json(user[0].talks);
  });
});
// additional version as post request.
router.post('/talks/user', mid.loggedIn, (req, res, next) => {
  console.log(req.session.userId);
  User.find({ _id: req.session.userId }, (err, user) => {
    if (err) return next(err);
    res.json(user[0].talks);
  });
});

/**
 * TODO: this isn't being used right and meybe needs to come out or add some sorta sync functionality
 * Send a new array of values to be updated on the server. Ideal for when the user
 * is adding and removing a lot on the client. Should only be sent when the client is
 * finished, i.e with a "save" button etc.
 * NOTE: this will replace the previous array in the user document.
 */
router.post('/talks/save', mid.loggedIn, (req, res, next) => {
  const talks = req.body.talks;
  const userId = req.session.userId;

  User.findByIdAndUpdate({ _id: userId }, { talks: talks }, (err, result) => {
    if (err) return next(err);
    return res.json(result);
  });
});

/**
 * This adds a rating to the talks document. It returns a value "nModified" which
 * indicates whether the user has already reviewd the talk.
 */
router.post('/talks/rate/:id', mid.loggedIn, (req, res, next) => {
  const id = req.params.id;
  const talkId = req.body.talkId;
  const rating = {
    userId: req.session.userId,
    rating: req.body.rating,
  };
  Talk.update(
    { id: id, 'ratings.userId': { $ne: rating.userId } },
    { $addToSet: { ratings: rating } },
    (err, result) => {
      if (err) return next(err);
      return res.json(result);
    }
  );
});

//TODO: add the mid.loggedIn back into middleware
/**
 * Add a talk to the users document. It will not add any duplicate ID's but there needs
 * to be logic on the client to prevent clashing of time lines for talks and for boundry data.
 */
router.post('/talks/add', mid.loggedIn, async (req, res, next) => {
  const talkId = req.body.talkId;
  const userId = req.session.userId;

  //console.log(req.headers);
  //console.log(req.body.talkId);

  // search for a talk by id
  let talkResult;
  await Talk.find({ id: talkId }, (err, result) => {
    talkResult = result;
  });

  User.update(
    { _id: userId, 'talks.id': { $ne: talkId } },
    { $push: { talks: talkResult } },
    (err, result) => {
      if (err) return next(err);
      return res.json(result);
    }
  );
});

// router.post('/talks/remove/:id', mid.loggedIn, async (req, res, next) => {
//   const talkId = req.params.id;
//   const userId = req.session.userId;

//   User.findByIdAndUpdate(
//     userId,
//     { $pull: { talks: { id: talkId } } },
//     (err, result) => {
//       if (err) return next(err);
//       return res.json('removed');
//     }
//   );
// });

router.post('/talks/remove', mid.loggedIn, async (req, res, next) => {
  const talkId = req.body.talkId;
  const userId = req.session.userId;

  User.update(
    { _id: userId },
    { $pull: { talks: { id: talkId } } },
    (err, result) => {
      if (err) return next(err);
      return res.json(result);
    }
  );
});

router.get('/sessions', function(req, res) {
  console.log('session');
  res.status(200);
  res.json([
    {
      id: 'A',
      title: 'Parallel Session A',
      location: 'Auditorium 1',
    },
    {
      id: 'B',
      title: 'Parallel Session B',
      location: 'Room 101',
    },
    {
      id: 'C',
      title: 'Parallel Session C',
      location: 'Room 335',
    },
  ]);
});

module.exports = router;
