const express = require('express');

const router = express.Router();

const {
    verify,
    update,
    add,
    hat_trick,
    man_of_match
} = require('../controllers/adminController');

router.post('/verify', verify);

router.get('/update', update);

router.post('/add', add);

router.post('/hat_trick', add);

router.post('/man_of_match', man_of_match);

module.exports = router;