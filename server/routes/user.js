const express = require('express');

const router = express.Router();

const {
    leagues,
    join,
    create
} = require('../controllers/userController');

router.post('/leagues', leagues);

router.post('/join', join);

router.post('/create', create);

module.exports = router;