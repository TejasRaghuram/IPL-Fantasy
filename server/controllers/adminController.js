require('dotenv').config();

const Player = require('./../models/Player');
const Match = require('./../models/Match');
const Squad = require('./../models/Squad');
const League = require('./../models/League');

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
    try {
        const matches_response = await fetch('https://cricket-live-data.p.rapidapi.com/fixtures-by-series/' + process.env.IPL_SERIES_ID, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.CRICKET_DATA_KEY,
                'X-RapidAPI-Host': 'cricket-live-data.p.rapidapi.com'
            }
        });
        const matches_json = await matches_response.json();
        const matches = matches_json.results;
        for(var i = 0; i < matches.length; i++)
        {
            if(matches[i].status === 'Complete')
            {
                const match_id = matches[i].id;
                const exists = await Match.findOne({'match_id': match_id});
                if(!exists)
                {
                    const match_response = await fetch('https://cricket-live-data.p.rapidapi.com/match/' + match_id, {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Key': process.env.CRICKET_DATA_KEY,
                            'X-RapidAPI-Host': 'cricket-live-data.p.rapidapi.com'
                        }
                    });
                    const match_json = await match_response.json();
                    await add_match(match_json);
                    await Match.create({
                        match_id
                    });
                }
            }
        }
        await calculate_player_bonuses();
        const leagues = await League.find({});
        for(var i = 0; i < leagues.length; i++)
        {
            await update_league(leagues[i].name);
        }
        res.status(200).json({});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const refresh_points = async (req, res) => {
    try {
        const players = Player.find({});
        for(var i = 0; i < players.length; i++)
        {
            players[i] = compute_points(players[i]);
            await players[i].save();
        }
        await calculate_player_bonuses();
        const leagues = await League.find({});
        for(var i = 0; i < leagues.length; i++)
        {
            await update_league(leagues[i].name);
        }
        res.status(200).json({});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const refresh = async (req, res) => {
    try {
        const player = await Player.find({});
        for(var i = 0; i < player.length; i++)
        {
            const name = player[i].name;
            const position = player[i].position;
            await Player.deleteOne({name: name});
            await Player.create({name, position});
        }
        const squads = await Squad.find({});
        for(var i = 0; i < squads.length; i++)
        {
            const username = squads[i].username;
            const league = squads[i].league;
            const players = squads[i].players;
            const captain = squads[i].captain;
            const vice_captain = squads[i].captain;
            await Squad.deleteOne({username: username, league: league});
            await Squad.create({username, league, players, captain, vice_captain})
        }
        const matches = await Match.find({});
        for(var i = 0; i < matches.length; i++)
        {
            await Match.deleteOne({match_id: matches[i].match_id});
        }
        res.status(200).json({});
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

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

const man_of_match = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        const player = await Player.findOne({'name': name});
        if(player)
        {
            player.man_of_matches++;
            player.base_points += 100;
            await player.save();
            await calculate_player_bonuses();
            const leagues = await League.find({});
            for(var i = 0; i < leagues.length; i++)
            {
                await update_league(leagues[i].name);
            }
        }
        else
        {
            res.status(400).json({error: 'Player Does Not Exist'});
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

const hat_trick = async (req, res) => {
    const {
        name
    } = req.body;

    try {
        const player = await Player.findOne({'name': name});
        if(player)
        {
            player.hat_tricks++;
            if(player.position === 'Batsman')
            {
                player.base_points += 1500;
            }
            else
            {
                player.base_points += 750;
            }
            await player.save();
            await calculate_player_bonuses();
            const leagues = await League.find({});
            for(var i = 0; i < leagues.length; i++)
            {
                await update_league(leagues[i].name);
            }
        }
        else
        {
            res.status(400).json({error: 'Player Does Not Exist'});
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

async function add_match(data) {
    const scorecard = data.results.live_details.scorecard;
    for(var innings = 0; innings < scorecard.length; innings++)
    {
        const batsmen = scorecard[innings].batting;
        for(var i = 0; i < batsmen.length; i++)
        {
            const batsman = batsmen[i];
            const player = await Player.findOne({'name': batsman.player_name});
            if(player)
            {
                player.runs += batsman.runs;
                if(batsman.runs >= 100)
                {
                    player.centuries++;
                }
                else if(batsman.runs >= 50)
                {
                    player.half_centuries++;
                }
                if(batsman.runs >= player.highest_score)
                {
                    player.highest_score = batsman.runs;
                }
                player.fours += batsman.fours;
                player.sixes += batsman.sixes;
                player.balls_faced += batsman.balls;
                if(batsman.how_out === 'not out')
                {
                    player.not_outs++;
                }
                else
                {
                    player.dismissals++;
                    if(batsman.runs === 0)
                    {
                        player.ducks++;
                    }
                    if(batsman.how_out.charAt(0) === 'c')
                    {
                        const dismissal = batsman.how_out.substring(2);
                        const dismissal_names = dismissal.split(' b ');
                        const catcher = convert_name(dismissal_names[0], data, innings);
                        const catcher_player = await Player.findOne({'name': catcher});
                        if(catcher_player)
                        {
                            catcher_player.catches++;
                            catcher_player.base_points = compute_points(catcher_player);
                            await catcher_player.save();
                        }
                    }
                    else if(batsman.how_out.charAt(0) === 's')
                    {
                        const dismissal = batsman.how_out.substring(3);
                        const dismissal_names = dismissal.split(' b ');
                        const stumper = convert_name(dismissal_names[0], data, innings);
                        const stumper_player = await Player.findOne({'name': stumper});
                        if(stumper_player)
                        {
                            stumper_player.stumpings++;
                            stumper_player.base_points = compute_points(stumper_player);
                            await stumper_player.save();
                        }
                    }
                }
                if(player.balls_faced > 0)
                {
                    player.strike_rate = 100 * (player.runs / player.balls_faced);   
                }
                if(player.dismissals === 0)
                {
                    player.batting_average = player.runs;
                }
                else
                {
                    player.batting_average = player.runs / player.dismissals;
                }

                player.base_points = compute_points(player);

                await player.save();
            }
        }

        const bowlers = scorecard[innings].bowling;
        for(var i = 0; i < bowlers.length; i++)
        {
            const bowler = bowlers[i];

            const player = await Player.findOne({'name': bowler.player_name});
            if(player)
            {
                player.wickets += bowler.wickets;
                if(bowler.wickets >= 6)
                {
                    player.six_wicket_hauls++;
                }
                else if(bowler.wickets >= 5)
                {
                    player.five_wicket_hauls++;
                }
                else if(bowler.wickets >= 4)
                {
                    player.four_wicket_hauls++;
                }
                player.dots += bowler.dot_balls;
                player.maidens += bowler.maidens;
                let overs = Number(bowler.overs);
                player.balls_bowled += 6 * (overs - overs % 1);
                player.balls_bowled += 10 * (overs % 1);
                player.runs_conceded += bowler.runs_conceded;
                if(player.wickets === 0)
                {
                    player.bowling_average = player.runs_conceded;
                }
                else
                {
                    player.bowling_average = player.runs_conceded / player.wickets;
                    player.bowling_strike_rate = player.balls_bowled / player.wickets;
                }
                player.economy = 6 * (player.runs_conceded / player.balls_bowled);

                player.base_points = compute_points(player);

                await player.save();
            }
        }
    }
}

async function update_league(league) {
    const squads = await Squad.find({'league': league});
    for(var i = 0; i < squads.length; i++)
    {
        squads[i].base_points = 0;
        squads[i].not_outs = 0;
        squads[i].dismissals = 0;
        squads[i].runs = 0;
        squads[i].balls_faced = 0;
        squads[i].centuries = 0;
        squads[i].half_centuries = 0;
        squads[i].ducks = 0;
        squads[i].fours = 0;
        squads[i].sixes = 0;
        squads[i].wickets = 0;
        squads[i].dots = 0;
        squads[i].balls_bowled = 0;
        squads[i].runs_conceded = 0;
        squads[i].maidens = 0;
        squads[i].man_of_matches = 0;
        squads[i].strike_rate = 0;
        squads[i].economy = 0;
        squads[i].batting_average = 0;
        squads[i].bowling_average = 0;
        for(var j = 0; j < squads[i].players.length; j++)
        {
            const player = await Player.findOne({'name': squads[i].players[j]});
            if(player.name === squads[i].captain)
            {
                squads[i].base_points += 2 * player.points;
            }
            else if(player.name === squads[i].vice_captain)
            {
                squads[i].base_points += Math.round(1.5 * player.points);
            }
            else
            {
                squads[i].base_points += player.points;
            }
            squads[i].not_outs += player.not_outs;
            squads[i].dismissals += player.dismissals;
            squads[i].runs += player.runs;
            squads[i].balls_faced += player.balls_faced;
            squads[i].centuries += player.centuries;
            squads[i].half_centuries += player.half_centuries;
            squads[i].ducks += player.ducks;
            squads[i].fours += player.fours;
            squads[i].sixes += player.sixes;
            squads[i].wickets += player.wickets;
            squads[i].dots += player.dots;
            squads[i].four_wicket_hauls += player.four_wicket_hauls;
            squads[i].five_wicket_hauls += player.five_wicket_hauls;
            squads[i].six_wicket_hauls += player.six_wicket_hauls;
            squads[i].balls_bowled += player.balls_bowled;
            squads[i].runs_conceded += player.runs_conceded;
            squads[i].maidens += player.maidens;
            squads[i].hat_tricks += player.hat_tricks;
            squads[i].catches += player.catches;
            squads[i].stumpings += player.stumpings;
            squads[i].man_of_matches += player.man_of_matches;
        }
        if(squads[i].dismissals === 0)
        {
            squads[i].batting_average = squads[i].runs;
        }
        else
        {
            squads[i].batting_average = squads[i].runs / squads[i].dismissals;
        }
        if(squads[i].balls_faced > 0)
        {
            squads[i].strike_rate = 100 * (squads[i].runs / squads[i].balls_faced);
        }
        if(squads[i].balls_bowled > 0)
        {
            squads[i].economy = 6 * (squads[i].runs_conceded / squads[i].balls_bowled);
        }
        if(squads[i].wickets === 0)
        {
            squads[i].bowling_average = squads[i].runs_conceded;
            squads[i].bowling_strike_rate = squads[i].balls_bowled;
        }
        else
        {
            squads[i].bowling_average = squads[i].runs_conceded / squads[i].wickets;
            squads[i].bowling_strike_rate = squads[i].balls_bowled / squads[i].wickets;
        }
        squads[i].points = squads[i].base_points;
        squads[i].bonuses = [];
        squads[i].bonuses_points = [];
        squads[i].save();
    }

    await add_league_bonus(league, 'not_outs', true);
    await add_league_bonus(league, 'runs', true);
    await add_league_bonus(league, 'batting_average', true);
    await add_league_bonus(league, 'strike_rate', true);
    await add_league_bonus(league, 'centuries', true);
    await add_league_bonus(league, 'half_centuries', true);
    await add_league_bonus(league, 'fours', true);
    await add_league_bonus(league, 'sixes', true);
    await add_league_bonus(league, 'wickets', true);
    await add_league_bonus(league, 'four_wicket_hauls', true);
    await add_league_bonus(league, 'five_wicket_hauls', true);
    await add_league_bonus(league, 'six_wicket_hauls', true);
    await add_league_bonus(league, 'dots', true);
    await add_league_bonus(league, 'economy', false);
    await add_league_bonus(league, 'bowling_average', false);
    await add_league_bonus(league, 'bowling_strike_rate', false);
    await add_league_bonus(league, 'maidens', true);
    await add_league_bonus(league, 'man_of_matches', true);
    await add_league_bonus(league, 'ducks', true);

    const teams = await Squad.find({'league': league});
    const bonuses = [
        'not_outs',
        'runs',
        'batting_average', 
        'strike_rate', 
        'centuries', 
        'half_centuries', 
        'fours', 
        'sixes',
        'wickets',
        'four_wicket_hauls',
        'five_wicket_hauls',
        'six_wicket_hauls',
        'dots',
        'economy',
        'bowling_average',
        'bowling_strike_rate',
        'maidens',
        'man_of_matches'
    ];
    for(var i = 0; i < bonuses.length; i++)
    {
        const winners = teams.filter((team) => {
            return team.bonuses.includes(bonuses[i]);
        });
        for(var j = 0; j < winners.length; j++)
        {
            winners[j].points += Math.round(1000 / winners.length);
            winners[j].bonuses_points.push(Math.round(1000 / winners.length));
            await winners[j].save();
        }
    }
    const losers = teams.filter((team) => {
        return team.bonuses.includes('ducks');
    });
    for(var i = 0; i < losers.length; i++)
    {
        losers[i].points -= Math.round(1000 / losers.length);
        losers[i].bonuses_points.push(Math.round(-1000 / losers.length));
        await losers[i].save();
    }
}

async function add_league_bonus(league, bonus, max)
{
    const teams = await Squad.find({'league': league});
    var best;
    if(max)
    {
        best = 0;
        for(var i = 0; i < teams.length; i++)
        {
            if(teams[i][bonus] > best)
            {
                if(bonus === 'strike_rate')
                {
                    if(teams[i].balls_faced >= 15)
                    {
                        best = teams[i][bonus];
                    }
                }
                else
                {
                    best = teams[i][bonus];
                }
            }
        }
    }
    else
    {
        var best = teams[0][bonus];
        for(var i = 0; i < teams.length; i++)
        {
            if(teams[i][bonus] < best)
            {
                if(bonus === 'economy')
                {
                    if(teams[i].balls_bowled >= 30)
                    {
                        best = teams[i][bonus];
                    }
                }
                else if(bonus === 'bowling_average' || bonus === 'bowling_strike_rate')
                {
                    if(teams[i].balls_bowled > 0)
                    {
                        best = teams[i][bonus];
                    }
                }
                else
                {
                    best = teams[i][bonus];
                }
            }
        }
    }
    for(var i = 0; i < teams.length; i++)
    {
        if(bonus === 'strike_rate')
        {
            if(teams[i][bonus] === best && teams[i].balls_faced >= 15)
            {
                teams[i].bonuses.push(bonus);
                await teams[i].save();
            }
        }
        else if(bonus === 'economy')
        {
            if(teams[i][bonus] === best && teams[i].balls_bowled >= 30)
            {
                teams[i].bonuses.push(bonus);
                await teams[i].save();
            }
        }
        else if(bonus === 'bowling_average' || bonus === 'bowling_strike_rate')
        {
            if(teams[i][bonus] === best && teams[i].balls_bowled > 0)
            {
                teams[i].bonuses.push(bonus);
                await teams[i].save();
            }
        }
        else
        {
            if(teams[i][bonus] === best)
            {
                teams[i].bonuses.push(bonus);
                await teams[i].save();
            }
        }
    }
}

function compute_points(player) {
    var points = 0;
    
    points += player.position === 'Bowler' ? player.runs * 4 : player.runs * 2;
    points += player.position === 'Bowler' ? player.fours * 8 : player.fours * 4;
    points += player.position === 'Bowler' ? player.sixes * 16 : player.sixes * 8;
    points += player.position === 'Bowler' ? player.ducks * -3 : player.ducks * -6;
    points += player.position === 'Bowler' ? player.half_centuries * 100 : player.half_centuries * 50;
    points += player.position === 'Bowler' ? player.centuries * 200 : player.centuries * 100;

    points += player.position === 'Batsman' ? player.wickets * 100 : player.wickets * 50;
    points += player.position === 'Batsman' ? player.dots * 10 : player.dots * 5;
    points += player.position === 'Batsman' ? player.four_wicket_hauls * 500 : player.four_wicket_hauls * 250;
    points += player.position === 'Batsman' ? player.five_wicket_hauls * 1000 : player.five_wicket_hauls * 500;
    points += player.position === 'Batsman' ? player.six_wicket_hauls * 2000 : player.six_wicket_hauls * 1000;
    points += player.position === 'Batsman' ? player.maidens * 300 : player.maidens * 150;
    points += player.position === 'Batsman' ? player.hat_tricks * 1500 : player.hat_tricks * 750;

    points += player.catches * 25;
    points += player.stumpings * 50;
    points += player.man_of_matches * 100;

    var run_points = 0;
    if(player.runs >= 850) run_points = 5000;
    else if(player.runs >= 800) run_points = 4500;
    else if(player.runs >= 750) run_points = 4000;
    else if(player.runs >= 700) run_points = 3500;
    else if(player.runs >= 650) run_points = 3000;
    else if(player.runs >= 600) run_points = 2500;
    else if(player.runs >= 550) run_points = 2000;
    else if(player.runs >= 500) run_points = 1500;
    else if(player.runs >= 450) run_points = 1000;
    else if(player.runs >= 400) run_points = 750;
    else if(player.runs >= 350) run_points = 500;
    else if(player.runs >= 300) run_points = 250;
    points += player.position === 'Bowler' ? run_points * 2 : run_points;

    var strike_rate_points = 0;
    if(player.balls_faced > 15)
    {
        if(player.strike_rate >= 200) strike_rate_points = 1000;
        else if(player.strike_rate >= 175) strike_rate_points = 800;
        else if(player.strike_rate >= 150) strike_rate_points = 600;
        else if(player.strike_rate >= 125) strike_rate_points = 400;
        else if(player.strike_rate >= 100) strike_rate_points = 200;
        else if(player.strike_rate >= 75) strike_rate_points = -100;
        else if(player.strike_rate >= 50) strike_rate_points = -200;
        else if(player.strike_rate >= 25) strike_rate_points = -300;
        else strike_rate_points = -500;
        if(player.position === 'Bowler') strike_rate_points = strike_rate_points > 0 ? strike_rate_points * 2 : strike_rate_points / 2;
    }
    points += strike_rate_points;
    

    var wicket_points = 0;
    if(player.wickets >= 35) wicket_points = 5000;
    else if(player.wickets >= 30) wicket_points = 4000;
    else if(player.wickets >= 25) wicket_points = 3000;
    else if(player.wickets >= 20) wicket_points = 2000;
    else if(player.wickets >= 15) wicket_points = 1000;
    points += player.position === 'Batsman' ? wicket_points * 2 : wicket_points;

    var economy_points = 0;
    if(player.balls_bowled >= 30)
    {
        if(player.economy > 11) economy_points = -500;
        else if(player.economy > 10) economy_points = -400;
        else if(player.economy > 9) economy_points = -200;
        else if(player.economy > 8) economy_points = -100;
        else if(player.economy > 6) economy_points = 100;
        else if(player.economy > 5) economy_points = 250;
        else if(player.economy > 4) economy_points = 500;
        else if(player.economy > 3) economy_points = 800;
        else if(player.economy > 2) economy_points = 1200;
        else if(player.economy > 1) economy_points = 1500;
        else economy_points = 2000;
        if(player.position === 'Batsman') economy_points = economy_points > 0 ? economy_points * 2 : economy_points / 2;
    }
    points += economy_points;

    return points;
}

function convert_name(name, data, innings) {
    if(innings === 0)
    {
        innings = 1;
    }
    else
    {
        innings = 0;
    }

    const players = data.results.live_details.scorecard[innings].batting.concat(data.results.live_details.scorecard[innings].still_to_bat);
    for(var i = 0; i < players.length; i++)
    {
        if(players[i].player_name.includes(name))
        {
            return players[i].player_name;
        }
    }
    return '';
}

async function calculate_player_bonuses() {
    const refresh = await Player.find({});
    for(var i = 0; i < refresh.length; i++)
    {
        refresh[i].points = refresh[i].base_points;
        refresh[i].bonuses = [];
        refresh[i].bonuses_points = [];
        refresh[i].save();
    }

    await add_bonus('not_outs', true);
    await add_bonus('runs', true);
    await add_bonus('batting_average', true);
    await add_bonus('strike_rate', true);
    await add_bonus('centuries', true);
    await add_bonus('half_centuries', true);
    await add_bonus('fours', true);
    await add_bonus('sixes', true);
    await add_bonus('highest_score', true);
    await add_bonus('wickets', true);
    await add_bonus('four_wicket_hauls', true);
    await add_bonus('five_wicket_hauls', true);
    await add_bonus('six_wicket_hauls', true);
    await add_bonus('dots', true);
    await add_bonus('economy', false);
    await add_bonus('bowling_average', false);
    await add_bonus('bowling_strike_rate', false);
    await add_bonus('maidens', true);
    await add_bonus('ducks', true);

    const players = await Player.find({});
    const bonuses = [
        'not_outs',
        'runs',
        'batting_average', 
        'strike_rate', 
        'centuries', 
        'half_centuries', 
        'fours', 
        'sixes',
        'highest_score',
        'wickets',
        'four_wicket_hauls',
        'five_wicket_hauls',
        'six_wicket_hauls',
        'dots',
        'economy',
        'bowling_average',
        'bowling_strike_rate',
        'maidens'
    ];
    for(var i = 0; i < bonuses.length; i++)
    {
        const winners = players.filter((player) => {
            return player.bonuses.includes(bonuses[i]);
        });
        for(var j = 0; j < winners.length; j++)
        {
            winners[j].points += Math.round(1000 / winners.length);
            winners[j].bonuses_points.push(Math.round(1000 / winners.length));
            await winners[j].save();
        }
    }
    const losers = players.filter((player) => {
        return player.bonuses.includes('ducks');
    });
    for(var i = 0; i < losers.length; i++)
    {
        losers[i].points -= Math.round(1000 / losers.length);
        losers[i].bonuses_points.push(Math.round(-1000 / losers.length));
        await losers[i].save();
    }
}

async function add_bonus(bonus, max)
{
    const players = await Player.find({});
    var best;
    if(max)
    {
        best = players[0][bonus];
        for(var i = 0; i < players.length; i++)
        {
            if(players[i][bonus] > best)
            {
                if(bonus === 'strike_rate')
                {
                    if(players[i].balls_faced >= 15)
                    {
                        best = players[i][bonus];
                    }
                }
                else
                {
                    best = players[i][bonus];
                }
            }
        }
    }
    else
    {
        var best = players[0][bonus];
        for(var i = 0; i < players.length; i++)
        {
            if(players[i][bonus] < best)
            {
                if(bonus === 'economy')
                {
                    if(players[i].balls_bowled >= 30)
                    {
                        best = players[i][bonus];
                    }
                }
                else if(bonus === 'bowling_average' || bonus === 'bowling_strike_rate')
                {
                    if(players[i].balls_bowled > 0)
                    {
                        best = players[i][bonus];
                    }
                }
                else
                {
                    best = players[i][bonus];
                }
            }
        }
    }
    for(var i = 0; i < players.length; i++)
    {
        if(bonus === 'strike_rate')
        {
            if(players[i][bonus] === best && players[i].balls_faced >= 15)
            {
                players[i].bonuses.push(bonus);
                await players[i].save();
            }
        }
        else if(bonus === 'economy')
        {
            if(players[i][bonus] === best && players[i].balls_bowled >= 30)
            {
                players[i].bonuses.push(bonus);
                await players[i].save();
            }
        }
        else if(bonus === 'bowling_average' || bonus === 'bowling_strike_rate')
        {
            if(players[i][bonus] === best && players[i].balls_bowled > 0)
            {
                players[i].bonuses.push(bonus);
                await players[i].save();
            }
        }
        else
        {
            if(players[i][bonus] === best)
            {
                players[i].bonuses.push(bonus);
                await players[i].save();
            }
        }
    }
}

module.exports = {
    verify,
    update,
    refresh_points,
    refresh,
    add,
    hat_trick,
    man_of_match
};