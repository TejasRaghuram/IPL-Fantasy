const express = require('express');

const router = express.Router();

const {
    users,
    squad,
    add
} = require('../controllers/leagueController');

router.post('/users', users);

router.post('/squad', squad);

router.post('/add', add);

module.exports = router;