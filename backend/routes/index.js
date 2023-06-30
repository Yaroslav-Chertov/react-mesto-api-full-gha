const express = require('express');
const { errors } = require('celebrate');
const usersRouter = require('./users');
const cardsRouter = require('./cards');
const auth = require('../middlewares/auth');

const { createUser, loginUser } = require('../controllers/users');

const { validateLogin, validateSignup } = require('../middlewares/validation');

const NotFound = require('../utils/errors/notFound');

const router = express.Router();

router.post('/signin', validateLogin, loginUser);
router.post('/signup', validateSignup, createUser);
router.use(auth);
router.use('/users', usersRouter);
router.use('/cards', cardsRouter);
router.use((req, res, next) => next(new NotFound('Такой страницы не существует')));
router.use(errors());

module.exports = router;
