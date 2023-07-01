const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const Unauthorized = require('../utils/errors/unauthorized');

const { JWT_SECRET = config.jwtSecretKey } = process.env;

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const bearer = 'Bearer ';
  if (!authorization || !authorization.startsWith(bearer)) {
    next(new Unauthorized('Необходима авторизация.'));
  }
  const token = authorization.replace(bearer, '');
  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Unauthorized('Необходима авторизация.');
    return next(error);
  }
  req.user = payload;
  return next();
};
