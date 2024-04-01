const express = require('express');

const router = express.Router();

const {
    verify,
    update,
    refresh,
    add,
    hat_trick,
    man_of_match
} = require('../controllers/adminController');

router.post('/verify', verify);

router.get('/update', update);

router.get('/refresh', refresh);

router.post('/add', add);

router.post('/hat_trick', hat_trick);

router.post('/man_of_match', man_of_match);

module.exports = router;