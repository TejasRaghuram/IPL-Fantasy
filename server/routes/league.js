const express = require('express');

const router = express.Router();

const {
    create,
    verify,
    join,
    squad
} = require('../controllers/leagueController');

router.post('/create', create);

router.post('/verify', verify);

router.post('/join', join);

router.post('/squad', squad)

module.exports = router;