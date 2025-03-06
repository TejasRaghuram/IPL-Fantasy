const { Player } = require('../models');

const update = async (req, res) => {
    try {
        res.status(200).json({});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const add_player = async (req, res) => {
    const {
        name,
        position,
        team,
        foreigner
    } = req.body;

    try {
        const player = await Player.create({
            name: name,
            position: position,
            team: team,
            foreigner: foreigner,
            base_points: 0,
            bonus_points: 0,
            bonuses: [],
            points: 0,
            runs: 0,
            fours: 0,
            sixes: 0,
            ducks: 0,
            half_centuries: 0,
            centuries: 0,
            strike_rate: 0,
            balls_faced: 0,
            batting_average: 0,
            not_outs: 0,
            dismissals: 0,
            highest_score: 0,
            wickets: 0,
            dots: 0,
            four_wicket_hauls: 0,
            five_wicket_hauls: 0,
            six_wicket_hauls: 0,
            maidens: 0,
            hat_tricks: 0,
            economy: 0,
            bowling_average: 0,
            bowling_strike_rate: 0,
            balls_bowled: 0,
            runs_conceded: 0,
            catches: 0,
            stumpings: 0,
            player_of_matches: 0
        });
        res.status(200).json(player);
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {
    update,
    add_player
}