const { User, League } = require('../models');
const bcrypt = require('bcrypt');

const create = async (req, res) => {
    const {
        username,
        name, 
        password
    } = req.body;

    try {
        if (username.length <= 3) {
            res.status(400).json({error: 'Usernames must be at least 4 characters long.'});
        }
        if (password.length <= 3) {
            res.status(400).json({error: 'Passwords must be at least 4 characters long.'});
        }
        bcrypt.hash(password, 0, async (err, hash) => {
            const user = await User.create({
                username: username,
                name: name,
                password: hash,
                leagues: []
            });
            res.status(200).json(user);
        });
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        username,
        password
    } = req.body;

    try {
        const user = await User.findOne({ where: {
            username: username
        }});
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                res.status(200).json(user);
            } else {
                res.status(400).json({error: 'Invalid Username or Password'});
            }
        });
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const leagues = async (req, res) => {
    const {
        username
    } = req.body;

    try {
        const user = await User.findOne({ where: {
            username: username
        }});
        const response = [];
        for (league in username.leagues) {
            const league = await League.findOne({ where: {
                name: league
            }});
            response.push(league);
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    leagues
};