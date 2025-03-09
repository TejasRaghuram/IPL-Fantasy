const { Player } = require('../models');

const all = async (req, res) => {
    try {
        const players = await Player.findAll({
            attributes: ['name', 'points', 'position', 'team', 'foreigner']
        });
        res.status(200).json(players);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const get = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        const player = await Player.findOne({ where: {
            name: name
        }});
        if (player) {
            res.status(200).json(player);
        } else {
            res.status(400).json({error: 'Player Does Not Exist'});
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    all,
    get
};