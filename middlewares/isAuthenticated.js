module.exports = (req, res, next) => {
  if (req.authenticated) return next();

  let error = new Error('Authentication required.');
  error.status = 403;
  return next(error);
};
