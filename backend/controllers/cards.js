const mongoose = require('mongoose');
const Card = require('../models/card');
const BadRequest = require('../utils/errors/badRequest');
const Forbidden = require('../utils/errors/forbidden');
const NotFound = require('../utils/errors/notFound');

const { SUCCESS_STATUS, CREATED_STATUS } = require('../utils/constants');

const fillOptions = [
  { path: 'likes', select: ['name', 'about', 'avatar', '_id'] },
  { path: 'owner', select: ['name', 'about', 'avatar', '_id'] },
];

const formatCard = (card) => ({
  likes: card.likes.map((user) => ({
    name: user.name,
    about: user.about,
    avatar: user.avatar,
    _id: user._id,
  })),
  _id: card._id,
  name: card.title,
  // name: card.name,
  link: card.link,
  owner: {
    name: card.owner.name,
    about: card.owner.about,
    avatar: card.owner.avatar,
    _id: card.owner._id,
  },
  createdAt: card.createdAt,
});

const getCards = (req, res, next) => {
  Card.find({})
    .populate(fillOptions)
    .then((cards) => res.status(SUCCESS_STATUS).send(cards))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ title: name, link, owner: req.user._id })
    .then((card) => res.status(CREATED_STATUS).send(card))
    .catch((err) => {
      if (err instanceof mongoose.Error.ValidationError) {
        return next(new BadRequest('Некорректные данные при создании карточки.'));
      }
      return next(err);
    });
};

const deleteCard = (req, res, next) => {
  const userId = req.user._id;
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      if (card.owner._id.toString() !== userId) {
        throw new Forbidden('Нет прав для удаления карточки с указанным _id.');
      }
      return Card.deleteOne({ _id: req.params.cardId })
        .then(() => {
          res.status(SUCCESS_STATUS).send({ message: 'Карточка удалена.' });
        });
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest('Карточка с указанным _id не найдена.'));
      }
      if (err instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFound('Несуществующий _id карточки.'));
      }
      return next(err);
    });
};

const updateLikes = (req, res, updateQuery, next) => {
  Card.findByIdAndUpdate(req.params.cardId, updateQuery, { new: true })
    .populate(fillOptions)
    .then((card) => {
      if (!card) {
        throw new NotFound('Несуществующий _id карточки.');
      }
      res.status(SUCCESS_STATUS).send(formatCard(card));
    })
    .catch((err) => {
      if (err instanceof mongoose.Error.CastError) {
        return next(new BadRequest('Неверные данные для лайка.'));
      }
      return next(err);
    });
};

const likeCard = (req, res, next) => {
  const updateQuery = { $addToSet: { likes: req.user._id } };
  updateLikes(req, res, updateQuery, next);
};

const dislikeCard = (req, res, next) => {
  const updateQuery = { $addToSet: { likes: req.user._id } };
  updateLikes(req, res, updateQuery, next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
