const Player = require('./../models/Player');

const points = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        const player = await Player.findOne({'name': name});
        if(!player)
        {
            res.status(400).json({error: 'Player Does Not Exist'});
        }
        else
        {
            res.status(200).json(player.points);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const all = async (req, res) => {
    
};

module.exports = {
    points,
    all
};