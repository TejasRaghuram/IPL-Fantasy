const Squad = require('./../models/Squad');

const users = async (req, res) => {
    const {
        league
    } = req.body;

    try {
        const users = await Squad.find({'league': league}, 'username points -_id');
        if(!users)
        {
            res.status(400).json({error: 'League Does Not Exist'});
        }
        else
        {
            res.status(200).json(users);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const squad = async (req, res) => {

};

module.exports = {
    users,
    squad
}