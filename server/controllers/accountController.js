const User = require('../models/User');

const create = async (req, res) => {
    const {
        username, 
        password
    } = req.body;
    const leagues = [];

    try {
        const exists = await User.findOne({'username': username});
        if(exists)
        {
            res.status(400).json({error: "Account Already Exists"});
        }
        else if(username.length === 0 || password.length === 0 || !username.match('/^[a-z0-9]+$/i') || !password.match('/^[a-z0-9]+$/i'))
        {
            res.status(400).json({error: "Invalid Username or Password"});
        }
        else
        {
            const account = await User.create({
                username, 
                password, 
                leagues
            });
            res.status(200).json(account);
        }
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
        const account = await User.findOne({'username': username});
        if(!account)
        {
            res.status(400).json({error: "Account Does Not Exist"});
        }
        else if(!account.password === password)
        {
            res.status(400).json({error: "Invalid Password"});
        }
        else
        {
            res.status(200);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify
};