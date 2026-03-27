const express = require('express');

const router = express.Router();

const {
    update,
    matches,
    add_player,
    add_matches
} = require('../controllers/adminController');

router.post('/update', update);

router.get('/matches', matches);

router.post('/add_player', add_player);

router.post('/add_matches', add_matches);

module.exports = router;