const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth.middleware');
const ctrl = require('../controllers/auth.controller');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);
router.get('/me', authenticateToken, ctrl.me);

module.exports = router;
