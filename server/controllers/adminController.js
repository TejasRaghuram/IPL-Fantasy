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

const matches = async (req, res) => {
    const response = await fetch('https://api.cricapi.com/v1/cricScore?apikey=' + process.env.CRICKETDATA_KEY);
    const json = await response.json();
    const teams = [
        'Rajasthan Royals [RR]', 
        'Chennai Super Kings [CSK]',
        'Gujarat Titans [GT]',
        'Kolkata Knight Riders [KKR]',
        'Punjab Kings [PBKS]',
        'Royal Challengers Bengaluru [RCB]',
        'Royal Challengers Bangalore [RCB]',
        'Sunrisers Hyderabad [SRH]',
        'Mumbai Indians [MI]',
        'Delhi Capitals [DC]',
        'Lucknow Super Giants [LSG]'
    ];
    const result = [];
    for(let i = json.data.length - 1; i >= 0; i--)
    {
        if(teams.includes(json.data[i].t1) && teams.includes(json.data[i].t2))
        {
            result.push({
                team1: json.data[i].t1,
                team2: json.data[i].t2,
                status: json.data[i].status,
                id: json.data[i].id
            });
        }
    }
    res.status(200).json(result);

}

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
            const player = Player.create({
                name,
                position
            });
            res.status(200).json(player);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    verify,
    matches,
    update,
    add
};