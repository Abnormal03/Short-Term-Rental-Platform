const express = require('express');
const { getMe } = require('../controllers/Auth.controller');
const router = express.Router();


router.get('/me', getMe);

module.exports = router;