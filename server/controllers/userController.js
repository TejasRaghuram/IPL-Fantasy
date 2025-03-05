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
            return res.status(400).json({error: 'Usernames Must be at Least 4 Characters Long'});
        }
        if (password.length <= 3) {
            return res.status(400).json({error: 'Passwords Must be at Least 4 Characters Long'});
        }
        const exists = await User.findOne({ where: {
            username: username
        }});
        if (exists) {
            return res.status(400).json({error: 'Username is Already Taken'});
        }
        bcrypt.hash(password, 0, async (err, hash) => {
            const user = await User.create({
                username: username,
                name: name,
                password: hash,
                leagues: []
            });
            return res.status(200).json(user);
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
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
        if (!user) {
            return res.status(400).json({error: 'Invalid Username or Password'});
        }
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                return res.status(200).json(user);
            } else {
                return res.status(400).json({error: 'Invalid Username or Password'});
            }
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
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
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    leagues
};