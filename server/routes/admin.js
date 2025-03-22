const express = require('express');

const router = express.Router();

const {
    update,
    matches,
    add_player,
    add_matches,
    reset_players,
    reset_leagues,
    reset_matches,
    replace_player
} = require('../controllers/adminController');

router.get('/update', update);

router.get('/matches', matches);

router.post('/add_player', add_player);

router.post('/add_matches', add_matches);

router.get('/reset_players', reset_players);

router.get('/reset_leagues', reset_leagues);

router.get('/reset_matches', reset_matches);

router.post('/replace_player', replace_player);

module.exports = router;