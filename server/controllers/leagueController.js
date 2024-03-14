const Squad = require('./../models/Squad');
const Player = require('./../models/Player');

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
    const {
        username,
        league
    } = req.body;

    try {
        const squad = await Squad.findOne({'username': username, 'league': league});
        if(!squad)
        {
            res.status(400).json({error: 'User or League Does Not Exist'});
        }
        else
        {
            res.status(200).json(squad);
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
};

const add = async (req, res) => {
    const {
        username,
        league,
        player
    } = req.body;

    try {
        const squad = await Squad.findOne({'username': username, 'league': league});
        if(!squad)
        {
            res.status(400).json({error: 'User or League Does Not Exist'});
        }
        else
        {
            if(squad.players.includes(player))
            {
                res.status(400).json({error: 'Player Already in Squad'});
            }
            else
            {
                const stats = await Player.findOne({'name': player});
                if(stats)
                {
                    squad.players.push(player);
                    if(squad.captain === ' ')
                    {
                        squad.captain = player;
                    }
                    else if(squad.vice_captain === ' ')
                    {
                        squad.vice_captain = player;
                    }
                    squad.base_points += stats.points;
                    squad.not_outs += stats.not_outs;
                    squad.dismissals += stats.dismissals;
                    squad.runs += stats.runs;
                    squad.balls_faced += stats.balls_faced;
                    squad.centuries += stats.centuries;
                    squad.half_centuries += stats.half_centuries;
                    squad.ducks += stats.ducks;
                    squad.fours += stats.fours;
                    squad.sixes += stats.sixes;
                    squad.wickets += stats.wickets;
                    squad.dots += stats.dots;
                    squad.balls_bowled += stats.balls_bowled;
                    squad.runs_conceded += stats.runs_conceded;
                    squad.maidens += stats.maidens;
                    squad.man_of_matches += stats.man_of_matches;
                    if(squad.dismissals === 0)
                    {
                        squad.batting_average = squad.runs;
                    }
                    else
                    {
                        squad.batting_average = squad.runs / squad.dismissals;
                    }
                    if(squad.balls_faced > 0)
                    {
                        squad.strike_rate = 100 * (squad.runs / squad.balls_faced);
                    }
                    if(squad.balls_bowled > 0)
                    {
                        squad.economy = 6 * (squad.runs_conceded / squad.balls_bowled);
                    }
                    if(squad.wickets > 0)
                    {
                        squad.bowling_average = squad.runs_conceded / squad.wickets;
                    }
                    await squad.save();
                    await refresh_league_bonuses(squad.league);
                    res.status(200).json(squad);
                }
                else
                {
                    res.status(400).json({error: 'Player Does Not Exist'});
                }
            }
        }
    } catch(error) {
        res.status(400).json({error: error.message});
    }
}

async function refresh_league_bonuses(league) {
    const refresh = await Squad.find({'league': league});
    for(var i = 0; i < refresh.length; i++)
    {
        refresh[i].bonuses = [];
        await refresh[i].save();
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

module.exports = {
    users,
    squad,
    add
}