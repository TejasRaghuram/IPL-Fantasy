require('dotenv').config();

const Player = require('./../models/Player');

const verify = async (req, res) => {
    const { 
        password
    } = req.body;
    const leagues = [];

    if(password === process.env.ADMIN_PASSWORD)
    {
        res.status(200).json(password);
    }
    else
    {
        res.status(400).json({error: 'Invalid Password'});
    }
};

const update = async (req, res) => {
    
};

const add = async (req, res) => {
    const {
        name,
        position
    } = req.body;

    try {
        const exists = await Player.findOne({'name': name});
        if(exists)
        {
            res.status(400).json({error: 'Player Already Exists'});
        }
        else
        {
            const points = 0;
            const runs = 0;
            const wickets = 0;
            const player = Player.create({
                name,
                position,
                points,
                runs,
                wickets
            });
            res.status(200).json(player);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    verify,
    update,
    add
};