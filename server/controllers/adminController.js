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
                }
                player.economy = 6 * (player.runs_conceded / player.balls_bowled);

                player.base_points = compute_points(player);

                await player.save();
            }
        }
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
            squads[i].balls_bowled += player.balls_bowled;
            squads[i].runs_conceded += player.runs_conceded;
            squads[i].maidens += player.maidens;
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
        }
        else
        {
            squads[i].bowling_average = squads[i].runs_conceded / squads[i].wickets;
        }
        squads[i].bonuses = [];
        squads[i].save();
    }

    await add_league_bonus(league, 'not_outs', true);
    await add_league_bonus(league, 'runs', true);
    await add_league_bonus(league, 'batting_average', true);
    await add_league_bonus(league, 'strike_rate', true);
    await add_league_bonus(league, 'centuries', true);
    await add_league_bonus(league, 'half_centuries', true);
    await add_league_bonus(league, 'ducks', true);
    await add_league_bonus(league, 'fours', true);
    await add_league_bonus(league, 'sixes', true);
    await add_league_bonus(league, 'wickets', true);
    await add_league_bonus(league, 'dots', true);
    await add_league_bonus(league, 'economy', false);
    await add_league_bonus(league, 'bowling_average', false);
    await add_league_bonus(league, 'maidens', true);
    await add_league_bonus(league, 'man_of_matches', true);

    const teams = await Squad.find({'league': league});
    for(var i = 0; i < teams.length; i++)
    {
        teams[i].points = teams[i].base_points + 1000 * (teams[i].bonuses.length);
        if(teams[i].bonuses.includes('ducks'))
        {
            teams[i].points -= 2000;
        }
        await teams[i].save();
    }
}

async function add_league_bonus(league, bonus, max)
{
    const teams = await Squad.find({'league': league});
    var best;
    if(max)
    {
        best = teams[0][bonus];
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
                else if(bonus === 'bowling_average')
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
        else if(bonus === 'bowling_average')
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
    if(player.position === 'Batsman')
    {
        var points = 0;

        points += 2 * player.runs;
        points += 4 * player.fours;
        points += 8 * player.sixes;
        points -= 6 * player.ducks;
        points += 50 * player.half_centuries;
        points += 100 * player.centuries;
        if(player.balls_faced >= 15)
        {
            if(player.strike_rate >= 200)
            {
                points += 1000;
            }
            else if(player.strike_rate >= 175)
            {
                points += 800;
            }
            else if(player.strike_rate >= 150)
            {
                points += 600;
            }
            else if(player.strike_rate >= 125)
            {
                points += 400;
            }
            else if(player.strike_rate >= 100)
            {
                points += 200;
            }
            else if(player.strike_rate >= 75)
            {
                points += -100;
            }
            else if(player.strike_rate >= 50)
            {
                points += -200;
            }
            else if(player.strike_rate >= 25)
            {
                points += -300;
            }
            else
            {
                points += -500;
            }
        }
        if(player.runs >= 850)
        {
            points += 5000;
        }
        else if(player.runs >= 800)
        {
            points += 4500;
        }
        else if(player.runs >= 750)
        {
            points += 4000;
        }
        else if(player.runs >= 700)
        {
            points += 3500;
        }
        else if(player.runs >= 650)
        {
            points += 3000;
        }
        else if(player.runs >= 600)
        {
            points += 2500;
        }
        else if(player.runs >= 550)
        {
            points += 2000;
        }
        else if(player.runs >= 500)
        {
            points += 1500;
        }
        else if(player.runs >= 450)
        {
            points += 1000;
        }
        else if(player.runs >= 400)
        {
            points += 750;
        }
        else if(player.runs >= 350)
        {
            points += 500;
        }
        else if(player.runs >= 300)
        {
            points += 250;
        }

        points += 100 * player.wickets;
        points += 10 * player.dots;
        points += 500 * player.four_wicket_hauls;
        points += 1000 * player.five_wicket_hauls;
        points += 2000 * player.six_wicket_hauls;
        points += 300 * player.maidens;
        points += 1500 * player.hat_tricks;
        if(player.balls_bowled >= 30)
        {
            if(player.economy >= 11)
            {
                points -= 250;
            }
            else if(player.economy >= 10)
            {
                points -= 200;
            }
            else if(player.economy >= 9)
            {
                points -= 100;
            }
            else if(player.economy >= 8)
            {
                points -= 50;
            }
            else if(player.economy >= 6)
            {
                points += 200;
            }
            else if(player.economy >= 5)
            {
                points += 500;
            }
            else if(player.economy >= 4)
            {
                points += 1000;
            }
            else if(player.economy >= 3)
            {
                points += 1600;
            }
            else if(player.economy >= 2)
            {
                points += 2400;
            }
            else if(player.economy >= 1)
            {
                points += 3000;
            }
            else 
            {
                points += 4000;
            }
        }
        if(player.wickets >= 35)
        {
            points += 10000;
        }
        else if(player.wickets >= 30)
        {
            points += 8000;
        }
        else if(player.wickets >= 25)
        {
            points += 6000;
        }
        else if(player.wickets >= 20)
        {
            points += 4000;
        }
        else if(player.wickets >= 15)
        {
            points += 2000;
        }
        
        points += 25 * player.catches;
        points += 50 * player.stumpings;

        points += 100 * player.man_of_matches;

        return points;
    }
    else if(player.position === 'Bowler')
    {
        var points = 0;

        points += 4 * player.runs;
        points += 8 * player.fours;
        points += 16 * player.sixes;
        points -= 3 * player.ducks;
        points += 100 * player.half_centuries;
        points += 200 * player.centuries;
        if(player.balls_faced >= 15)
        {
            if(player.strike_rate >= 200)
            {
                points += 2000;
            }
            else if(player.strike_rate >= 175)
            {
                points += 1600;
            }
            else if(player.strike_rate >= 150)
            {
                points += 1200;
            }
            else if(player.strike_rate >= 125)
            {
                points += 800;
            }
            else if(player.strike_rate >= 100)
            {
                points += 400;
            }
            else if(player.strike_rate >= 75)
            {
                points += -50;
            }
            else if(player.strike_rate >= 50)
            {
                points += -100;
            }
            else if(player.strike_rate >= 25)
            {
                points += -150;
            }
            else
            {
                points += -250;
            }
        }
        if(player.runs >= 850)
        {
            points += 10000;
        }
        else if(player.runs >= 800)
        {
            points += 9000;
        }
        else if(player.runs >= 750)
        {
            points += 8000;
        }
        else if(player.runs >= 700)
        {
            points += 7000;
        }
        else if(player.runs >= 650)
        {
            points += 6000;
        }
        else if(player.runs >= 600)
        {
            points += 5000;
        }
        else if(player.runs >= 550)
        {
            points += 4000;
        }
        else if(player.runs >= 500)
        {
            points += 3000;
        }
        else if(player.runs >= 450)
        {
            points += 2000;
        }
        else if(player.runs >= 400)
        {
            points += 1500;
        }
        else if(player.runs >= 350)
        {
            points += 1000;
        }
        else if(player.runs >= 300)
        {
            points += 500;
        }

        points += 50 * player.wickets;
        points += 5 * player.dots;
        points += 250 * player.four_wicket_hauls;
        points += 500 * player.five_wicket_hauls;
        points += 1000 * player.six_wicket_hauls;
        points += 150 * player.maidens;
        points += 750 * player.hat_tricks;
        if(player.balls_bowled >= 30)
        {
            if(player.economy >= 11)
            {
                points -= 500;
            }
            else if(player.economy >= 10)
            {
                points -= 400;
            }
            else if(player.economy >= 9)
            {
                points -= 200;
            }
            else if(player.economy >= 8)
            {
                points -= 100;
            }
            else if(player.economy >= 6)
            {
                points += 100;
            }
            else if(player.economy >= 5)
            {
                points += 250;
            }
            else if(player.economy >= 4)
            {
                points += 500;
            }
            else if(player.economy >= 3)
            {
                points += 800;
            }
            else if(player.economy >= 2)
            {
                points += 1200;
            }
            else if(player.economy >= 1)
            {
                points += 1500;
            }
            else 
            {
                points += 2000;
            }
        }
        if(player.wickets >= 35)
        {
            points += 5000;
        }
        else if(player.wickets >= 30)
        {
            points += 4000;
        }
        else if(player.wickets >= 25)
        {
            points += 3000;
        }
        else if(player.wickets >= 20)
        {
            points += 2000;
        }
        else if(player.wickets >= 15)
        {
            points += 1000;
        }
        
        points += 25 * player.catches;
        points += 50 * player.stumpings;

        points += 100 * player.man_of_matches;

        return points;
    }
    else
    {
        var points = 0;

        points += 2 * player.runs;
        points += 4 * player.fours;
        points += 8 * player.sixes;
        points -= 6 * player.ducks;
        points += 50 * player.half_centuries;
        points += 100 * player.centuries;
        if(player.balls_faced >= 15)
        {
            if(player.strike_rate >= 200)
            {
                points += 1000;
            }
            else if(player.strike_rate >= 175)
            {
                points += 800;
            }
            else if(player.strike_rate >= 150)
            {
                points += 600;
            }
            else if(player.strike_rate >= 125)
            {
                points += 400;
            }
            else if(player.strike_rate >= 100)
            {
                points += 200;
            }
            else if(player.strike_rate >= 75)
            {
                points += -100;
            }
            else if(player.strike_rate >= 50)
            {
                points += -200;
            }
            else if(player.strike_rate >= 25)
            {
                points += -300;
            }
            else
            {
                points += -500;
            }
        }
        if(player.runs >= 850)
        {
            points += 5000;
        }
        else if(player.runs >= 800)
        {
            points += 4500;
        }
        else if(player.runs >= 750)
        {
            points += 4000;
        }
        else if(player.runs >= 700)
        {
            points += 3500;
        }
        else if(player.runs >= 650)
        {
            points += 3000;
        }
        else if(player.runs >= 600)
        {
            points += 2500;
        }
        else if(player.runs >= 550)
        {
            points += 2000;
        }
        else if(player.runs >= 500)
        {
            points += 1500;
        }
        else if(player.runs >= 450)
        {
            points += 1000;
        }
        else if(player.runs >= 400)
        {
            points += 750;
        }
        else if(player.runs >= 350)
        {
            points += 500;
        }
        else if(player.runs >= 300)
        {
            points += 250;
        }

        points += 50 * player.wickets;
        points += 5 * player.dots;
        points += 250 * player.four_wicket_hauls;
        points += 500 * player.five_wicket_hauls;
        points += 1000 * player.six_wicket_hauls;
        points += 150 * player.maidens;
        points += 750 * player.hat_tricks;
        if(player.balls_bowled >= 30)
        {
            if(player.economy >= 11)
            {
                points -= 500;
            }
            else if(player.economy >= 10)
            {
                points -= 400;
            }
            else if(player.economy >= 9)
            {
                points -= 200;
            }
            else if(player.economy >= 8)
            {
                points -= 100;
            }
            else if(player.economy >= 6)
            {
                points += 100;
            }
            else if(player.economy >= 5)
            {
                points += 250;
            }
            else if(player.economy >= 4)
            {
                points += 500;
            }
            else if(player.economy >= 3)
            {
                points += 800;
            }
            else if(player.economy >= 2)
            {
                points += 1200;
            }
            else if(player.economy >= 1)
            {
                points += 1500;
            }
            else 
            {
                points += 2000;
            }
        }
        if(player.wickets >= 35)
        {
            points += 5000;
        }
        else if(player.wickets >= 30)
        {
            points += 4000;
        }
        else if(player.wickets >= 25)
        {
            points += 3000;
        }
        else if(player.wickets >= 20)
        {
            points += 2000;
        }
        else if(player.wickets >= 15)
        {
            points += 1000;
        }
        
        points += 25 * player.catches;
        points += 50 * player.stumpings;

        points += 100 * player.man_of_matches;

        return points;
    }
}

function convert_name(name, data, innings) {
    if(innings = 0)
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
        refresh[i].bonuses = [];
        refresh[i].save();
    }

    await add_bonus('not_outs', true);
    await add_bonus('runs', true);
    await add_bonus('batting_average', true);
    await add_bonus('strike_rate', true);
    await add_bonus('centuries', true);
    await add_bonus('half_centuries', true);
    await add_bonus('ducks', true);
    await add_bonus('fours', true);
    await add_bonus('sixes', true);
    await add_bonus('wickets', true);
    await add_bonus('dots', true);
    await add_bonus('economy', false);
    await add_bonus('bowling_average', false);
    await add_bonus('maidens', true);
    await add_bonus('man_of_matches', true);

    const players = await Player.find({});
    for(var i = 0; i < players.length; i++)
    {
        players[i].points = players[i].base_points + 1000 * (players[i].bonuses.length);
        if(players[i].bonuses.includes('ducks'))
        {
            players[i].points -= 2000;
        }
        await players[i].save();
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
                else if(bonus === 'bowling_average')
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
        else if(bonus === 'bowling_average')
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
    add
};