const { League, User, Player } = require('../models');
const bcrypt = require('bcrypt');

const create = async (req, res) => {
    const {
        name, 
        password,
        players
    } = req.body;

    try {
        if (name.length <= 3) {
            return res.status(400).json({error: 'Names Must be at Least 4 Characters Long'});
        }
        if (password.length <= 3) {
            return res.status(400).json({error: 'Passwords Must be at Least 4 Characters Long'});
        }
        if (players < 2 || players > 18) {
            return res.status(400).json({error: 'Squads Must Have at Least 2 Players and at Most 18 Players'})
        }
        const exists = await League.findOne({ where: {
            name: name
        }});
        if (exists) {
            return res.status(400).json({error: 'Name is Already Taken'});
        }
        bcrypt.hash(password, 0, async (err, hash) => {
            const user = await League.create({
                name: name,
                password: hash,
                squads: [],
                players: players
            });
            return res.status(200).json(user);
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
    }
}

const verify = async (req, res) => {
    const {
        name,
        password
    } = req.body;

    try {
        const league = await League.findOne({ where: {
            name: name
        }});
        if (!league) {
            return res.status(400).json({error: 'Invalid Name or Password'});
        }
        bcrypt.compare(password, league.password, function(err, result) {
            if (result) {
                return res.status(200).json(league);
            } else {
                return res.status(400).json({error: 'Invalid Name or Password'});
            }
        });
    } catch(error) {
        return res.status(400).json({error: error.message});
    }
}

const join = async (req, res) => {
    const {
        username,
        name,
        players,
        captain,
        vice_captain
    } = req.body;

    try {
        const user = await User.findOne({ where: {
            username: username
        }});
        if (!user) {
            return res.status(400).json({error: 'User Does Not Exist'});
        }
        const league = await League.findOne({ where: {
            name: name
        }});
        if (!league) {
            return res.status(400).json({error: 'League Does Not Exist'});
        }
        if (league.squads.length == 10) {
            return res.status(400).json({error: 'League is Full'});
        }
        let exists = false;
        for (const squad of league.squads) {
            if (username == squad.username) {
                exists = true;
            }
        }
        if (exists) {
            return res.status(400).json({error: 'Already in League'});
        }
        if (players.length + 2 != league.players) {
            return res.status(400).json({error: 'Incorrect Number of Players'});
        }
        const members = [];
        for (const player of players) {
            const exists = await Player.findOne({ where: {
                name: player
            }});
            if (!exists) {
                return res.status(400).json({error: player + ' Does Not Exist'});
            } else {
                members.push({
                    name: name,
                    active: true,
                    earned: 0
                });
            }
        }
        const captainEntry = Player.findOne({ where: {
            name: captain
        }});
        if (!captainEntry) {
            return res.status(400).json({error: captain + ' Does Not Exist'});
        } else {
            members.push({
                name: captain,
                active: true,
                earned: 0
            });
        }
        const viceCaptainEntry = Player.findOne({ where: {
            name: vice_captain
        }});
        if (!viceCaptainEntry) {
            return res.status(400).json({error: vice_captain + ' Does Not Exist'});
        } else {
            members.push({
                name: vice_captain,
                active: true,
                earned: 0
            });
        }
        user.leagues.push(league);
        squad = {
            username: username,
            name: user.name,
            base_points: 0,
            bonus_points: 0,
            points: 0,
            captain: captain,
            vice_captain: vice_captain,
            players: members,
            bonuses: [],
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
        };
        league.squads.push(squad);
        await user.save();
        await league.save();
        return res.status(200).json(league);
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

const squad = async (req, res) => {
    const {
        username,
        name
    } = req.body;

    try {
        const user = await User.findOne({ where: {
            username: username
        }});
        if (!user) {
            return res.status(400).json({error: 'User Does Not Exist'});
        }
        const league = await League.findOne({ where: {
            name: league
        }});
        if (!league) {
            return res.status(400).json({error: 'League Does Not Exist'});
        }
        for (squad of league.squads) {
            if (username == squad.username) {
                return res.status(200).json(squad);
            }
        }
        return res.status(400).json({error: 'User is not in League'});
    } catch (error) {
        return res.status(400).json({error: error.message});
    }
}

module.exports = {
    create,
    verify,
    join,
    squad
};