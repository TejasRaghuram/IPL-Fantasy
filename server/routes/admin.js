const express = require('express');

const router = express.Router();

const {
    verify,
    update,
    refresh_points,
    refresh,
    add,
    hat_trick,
    man_of_match,

    averages
} = require('../controllers/adminController');

router.post('/verify', verify);

router.get('/update', update);

router.get('/refresh_points', refresh_points);

router.get('/refresh', refresh);

router.post('/add', add);

router.post('/hat_trick', hat_trick);

router.post('/man_of_match', man_of_match);

router.get('/averages', averages);

module.exports = router;