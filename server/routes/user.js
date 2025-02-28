const express = require('express');

const router = express.Router();

const {
    create,
    verify,
    leagues
} = require('../controllers/userController');

router.post('/create', create);

router.post('/verify', verify);

router.post('/leagues', leagues);

module.exports = router;