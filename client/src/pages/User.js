import { useState, useContext, useEffect } from 'react';
import { UserContext } from './../UserContext.js';
import { useParams, useNavigate } from 'react-router-dom';
import './../styles/User.css';

function Player(props) {
    const navigate = useNavigate();
    const [image, setImage] = useState('https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4');

    const check = new Image();
    check.src = "https://scores.iplt20.com/ipl/playerimages/" + props.player.name.replaceAll(' ', '%20') + '.png';
    check.onload = () => {
        setImage(check.src);
    };

    var name = props.player.name;
    var points = props.player.points;
    if(props.player.captain)
    {
        name += ' (C)';
    }
    else if(props.player.vice_captain)
    {
        name += ' (VC)';
    }

    return(
        <div class='user-player-body'>
            <div class='user-player-rank-body'>
                <p class='user-player-rank'>{props.rank}</p>
            </div>
            <img class='user-player-image' src={image} alt=''/>
            <p class='user-player-name' onClick={() => {
                navigate('/profile/' + props.player.name.replaceAll(' ', '%20'));
            }}>{name}</p>
            <p class='user-player-points'>{points}</p>
        </div>
    );
}

function Add(props) {
    let params = useParams();
    const user = useContext(UserContext);
    const [open, setOpen] = useState(false);

    if(params.username === user.username)
    {
        return(
            <div>
                <button class='user-button' onClick={() =>{
                    setOpen(!open);
                }}>Add {props.caption}</button>
                {open && 
                <div id='user-add'>
                    <label for='league-name'>Player Name:</label>
                    <br/>
                    <input id='home-join-name' class='home-input' type='text' name='league-name'/>
                    <br/>
                    <input id='home-submit' type='button' value='Submit' onClick={async () => {
                        const username = user.username;
                        const league = params.league;
                        const player = document.getElementById('home-join-name').value;
                        const response = await fetch('https://ipl-fantasy-api.onrender.com/api/league/add', {
                            method: 'post',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, league, player})
                        });
                        document.getElementById('home-join-name').value = '';
                        if(response.ok)
                        {
                            props.refresh(!props.current);
                        }
                        else
                        {
                            document.getElementById('home-join-name').value = '';
                            const json = await response.json();
                            alert(json.error);
                        }
                    }}/>
                </div>}
            </div>
        );  
    }
    else
    {
        return;
    }
}

function User() {
    let params = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(<p>Loading...</p>)
    const [refresh, setRefresh] = useState(false);
    
    useEffect(() => {
        const username = params.username;
        const league = params.league;
        fetch('https://ipl-fantasy-api.onrender.com/api/league/squad', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, league})
        })
            .then(response => response.json())
            .then(async (json) => {
                try {
                    const players = [];
                    const result = await fetch('https://ipl-fantasy-api.onrender.com/api/players/all', {
                        method: 'get',
                        headers: {'Content-Type': 'application/json'},
                    });
                    const player_data = await result.json();
                    for(let i = 0; i < json.players.length; i++)
                    {
                        var name = json.players[i];
                        var points = player_data.find(player => player.name === json.players[i]).points;
                        var captain = false;
                        var vice_captain = false;
                        if(name === json.captain)
                        {
                            captain = true;
                            points *= 2;
                        }
                        else if(name === json.vice_captain)
                        {
                            vice_captain = true;
                            points *= 1.5;
                            points = Math.round(points);
                        }
                        players.push({
                            name: name,
                            points: points,
                            captain: captain,
                            vice_captain: vice_captain
                        });
                    }
                    if(players.length > 0)
                    {
                        const rank = (p1, p2) => {
                            return p2.points - p1.points;
                        };
                        players.sort(rank);
                        const page = [];
                        let currentRank = 1;
                        let currentPoints = players[0].points;
                        for(let i = 0; i < players.length; i++)
                        {
                            if(players[i].points < currentPoints)
                            {
                                currentRank++;
                                currentPoints = players[i].points;
                            }
                            page.push(<Player rank={currentRank} player={players[i]}/>);
                        }
                        page.push(
                            <div id='user-stats'>
                                <h2 id='user-stats-header'>Team Stats</h2>
                                <h3 class='user-header'>Batting Stats</h3>
                                <table class='user-table'>
                                    <tr class='user-table-header'>
                                        <th class='user-table-element'>Name</th>
                                        <th class='user-table-element'>Amount</th>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Runs</td>
                                        <td class='user-table-element'>{json.runs}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Fours</td>
                                        <td class='user-table-element'>{json.fours}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Sixes</td>
                                        <td class='user-table-element'>{json.sixes}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Ducks</td>
                                        <td class='user-table-element'>{json.ducks}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Half Centuries</td>
                                        <td class='user-table-element'>{json.half_centuries}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Centuries</td>
                                        <td class='user-table-element'>{json.centuries}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Strike Rate</td>
                                        <td class='user-table-element'>{json.balls_faced > 0 ? Math.round(json.strike_rate*1000)/1000:'-'}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Balls Faced</td>
                                        <td class='user-table-element'>{json.balls_faced}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Batting Average</td>
                                        <td class='user-table-element'>{json.balls_faced > 0 ? Math.round(json.batting_average*1000)/1000:'-'}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Not Outs</td>
                                        <td class='user-table-element'>{json.not_outs}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Dismissals</td>
                                        <td class='user-table-element'>{json.dismissals}</td>
                                    </tr>
                                </table>
                                <h3 class='user-header'>Bowling Stats</h3>
                                <table class='user-table'>
                                    <tr class='user-table-header'>
                                        <th class='user-table-element'>Name</th>
                                        <th class='user-table-element'>Amount</th>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Wickets</td>
                                        <td class='user-table-element'>{json.wickets}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Dots</td>
                                        <td class='user-table-element'>{json.dots}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Four Wicket Hauls</td>
                                        <td class='user-table-element'>{json.four_wicket_hauls}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Five Wicket Hauls</td>
                                        <td class='user-table-element'>{json.five_wicket_hauls}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Six Wicket Hauls</td>
                                        <td class='user-table-element'>{json.six_wicket_hauls}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Maidens</td>
                                        <td class='user-table-element'>{json.maidens}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Hat Tricks</td>
                                        <td class='user-table-element'>{json.hat_tricks}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Economy</td>
                                        <td class='user-table-element'>{json.balls_bowled > 0 ? Math.round(json.economy*1000)/1000:'-'}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Bowling Average</td>
                                        <td class='user-table-element'>{json.balls_bowled > 0 ? Math.round(json.bowling_average*1000)/1000:'-'}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Balls Bowled</td>
                                        <td class='user-table-element'>{json.balls_bowled}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Runs Conceded</td>
                                        <td class='user-table-element'>{json.runs_conceded}</td>
                                    </tr>
                                </table>
                                <h3 class='user-header'>General Stats</h3>    
                                <table class='user-table'>
                                    <tr class='user-table-header'>
                                        <th class='user-table-element'>Name</th>
                                        <th class='user-table-element'>Amount</th>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Catches</td>
                                        <td class='user-table-element'>{json.catches}</td>
                                    </tr>
                                    <tr class='user-table-even'>
                                        <td class='user-table-element'>Stumpings</td>
                                        <td class='user-table-element'>{json.stumpings}</td>
                                    </tr>
                                    <tr class='user-table-odd'>
                                        <td class='user-table-element'>Man of the Match Awards</td>
                                        <td class='user-table-element'>{json.man_of_matches}</td>
                                    </tr>
                                </table>
                            </div>
                        );
                        page.push(<Add current={refresh} refresh={setRefresh} caption={players.length === 1? 'Vice Captain':'Player'}/>);
                        setContent(page);
                    }
                    else
                    {
                        setContent(<Add current={refresh} refresh={setRefresh} caption={'Captain'}/>);
                    }
                } catch(error) {
                    alert(error.stack);
                    navigate('/');
                }
            });
    }, [params.username, params.league, navigate, refresh]);

    return(
        <div id='user-content'>
            <h2>{params.league}</h2>
            <h1>{params.username}</h1>
            {content}
        </div>
    );
}

export default User;