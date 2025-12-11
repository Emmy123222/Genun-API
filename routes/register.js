const express = require('express');

const { auth } = require('../middleware/auth');

const router = express.Router();

const registerController = require('../controllers/register');

router.get('/', auth, registerController.getUser);

router.post('/verify-email', registerController.sendMailToUser);

router.get('/verify-email/:token', registerController.verifyEmailWithToken);

router.post('/', registerController.createUser);

router.put("/:userId", auth, registerController.updateUser);

router.delete('/:userId', auth,  registerController.deleteUser);

module.exports = router;