const router = require('express').Router();

const {
  getCards, createCard, deleteCard, likeCard, dislikeCard,
} = require('../controllers/cards');

const { validateCreateCard, validateInputIdCard } = require('../middlewares/validation');

router.get('/', getCards);
router.post('/', validateCreateCard, createCard);
router.delete('/:cardId', validateInputIdCard, deleteCard);
router.put('/:cardId/likes', validateInputIdCard, likeCard);
router.delete('/:cardId/likes', validateInputIdCard, dislikeCard);

module.exports = router;
