const express = require('express');

const router = express.Router();

const {
    update,
    add_player,
    add_matches,
    reset_players,
    reset_leagues,
    replace_player
} = require('../controllers/adminController');

router.get('/update', update);

router.post('/add_player', add_player);

router.post('/add_matches', add_matches);

router.get('/reset_players', reset_players);

router.get('/reset_leagues', reset_leagues);

router.post('/replace_player', replace_player);

module.exports = router;