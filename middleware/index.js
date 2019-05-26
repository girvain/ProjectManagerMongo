function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/dashboard');
  }
  return next();
}
module.exports.loggedOut = loggedOut;

// Function to check if the user is logged in
function loggedIn(req, res, next) {
  if (!req.session.userId) {
    var err = new Error('You are not authorized to view this page.');
    err.status = 403;
    return next(err);
  } else {
    next();
  }
}
module.exports.loggedIn = loggedIn;
