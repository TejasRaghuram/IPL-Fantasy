const express = require('express');

const router = express.Router();

const {
    users,
    squad
} = require('../controllers/leagueController');

router.post('/users', users);

router.post('/squad', squad);

module.exports = router;