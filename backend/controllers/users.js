const mongoose = require('mongoose');
const { Error } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
// const config = require('../utils/config');
const BadRequest = require('../utils/errors/badRequest');
const Conflict = require('../utils/errors/conflict');
const NotFound = require('../utils/errors/notFound');
// const Unauthorized = require('../utils/errors/unauthorized');

// const { JWT_SECRET = config.jwtSecretKey } = process.env;
const { NODE_ENV, JWT_SECRET } = process.env;

const { SUCCESS_STATUS, CREATED_STATUS } = require('../utils/constants');

const formatUser = (user) => ({
  name: user.name,
  about: user.about,
  avatar: user.avatar,
  _id: user._id,
  email: user.email,
});

const getUserById = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.status(SUCCESS_STATUS).send(formatUser(user));
    })
    .catch((err) => {
      if (err instanceof Error.CastError) {
        return next(new BadRequest('Пользователь с указанным _id не найден.'));
      }
      if (err instanceof Error.DocumentNotFoundError) {
        return next(new NotFound('Пользователь с указанным id не найден.'));
      }
      return next(err);
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    })
      .then((user) => res.status(CREATED_STATUS).send(formatUser(user)))
      .catch((err) => {
        if (err instanceof Error.ValidationError) {
          return next(new BadRequest('Некорректные данные при создании пользователя.'));
        }
        if (err.code === 11000) {
          return next(new Conflict('Пользователь с такой почтой уже зарегистрирован.'));
        }
        return next(err);
      })
      .catch(next));
};

// const loginUser = (req, res, next) => {
//   const { email, password } = req.body;
//   User.findOne({ email })
//     .select('+password')
//     .orFail()
//     .then((user) => bcrypt.compare(password, user.password).then((match) => {
//       if (match) {
//         const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
//           expiresIn: '7d',
//         });
//         res.cookie('jwtToken', token, {
//           maxAge: 3600,
//           httpOnly: true,
//         });
//         return res.send({ jwtToken: token });
//       }
//       throw new Unauthorized('Email или пароль неверные.');
//     }))
//     .catch((err) => {
//       if (err instanceof Error.DocumentNotFoundError) {
//         return next(new Unauthorized('Email или пароль неверные.'));
//       }
//       return next(err);
//     });
// };

const loginUser = (req, res, next) => {
  User.findOne(req.body.email, req.body.password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch((err) => {
      next(err);
    });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(SUCCESS_STATUS).send(users.map((user) => formatUser(user))))
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFound('Пользователь с указанным _id не найден.');
    })
    .then((user) => res.status(SUCCESS_STATUS).send(formatUser(user)))
    .catch(next);
};

const updateUser = (req, res, updateData, next) => {
  User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  })
    .then((user) => {
      res.status(SUCCESS_STATUS).send(formatUser(user));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Некорректные данные при обновлении пользователя.'));
      }
      return next(err);
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  updateUser(req, res, { name, about });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  updateUser(req, res, { avatar });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  loginUser,
  getUserInfo,
  updateProfile,
  updateAvatar,
};
