const { celebrate, Joi } = require('celebrate');

const regExp = /^https?:\/\/(www\.)?[a-zA-Z0-9\-.]{1,}\.[a-zA-Z]{1,4}[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]{1,}/;

const validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
});

const validateSignup = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(regExp),
  }),
});

const validateGetUserById = celebrate({
  params: Joi.object().keys({
    userId: Joi.string().required().hex().length(24),
  }),
});

const validateUpdateProfile = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
});

const validateUpdateAvatar = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(regExp),
  }),
});

const validateCreateCard = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().regex(regExp),
  }),
});

const validateInputIdCard = celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().required().hex().length(24),
  }),
});

module.exports = {
  validateLogin,
  validateSignup,
  validateGetUserById,
  validateUpdateProfile,
  validateUpdateAvatar,
  validateCreateCard,
  validateInputIdCard,
};
