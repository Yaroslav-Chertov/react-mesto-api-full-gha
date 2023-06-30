const router = require('express').Router();

const {
  getUserById, getUsers, getUserInfo, updateAvatar, updateProfile,
} = require('../controllers/users');

const { validateGetUserById, validateUpdateAvatar, validateUpdateProfile } = require('../middlewares/validation');

router.get('/', getUsers);
router.get('/me', getUserInfo);
router.get('/:userId', validateGetUserById, getUserById);
router.patch('/me', validateUpdateProfile, updateProfile);
router.patch('/me/avatar', validateUpdateAvatar, updateAvatar);

module.exports = router;
