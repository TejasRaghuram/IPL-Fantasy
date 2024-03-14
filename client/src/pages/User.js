import { useState, useContext, useEffect } from 'react';
import { UserContext } from './../UserContext.js';
import { useParams, useNavigate } from 'react-router-dom';
import './../styles/User.css';

function Player(props) {
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
        <div class='player-body'>
            <div class='player-rank-body'>
                <p class='player-rank'>{props.rank}</p>
            </div>
            <img class='player-image' src={image} alt=''/>
            <p class='player-name'>{name}</p>
            <p class='player-points'>{points}</p>
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
                }}>Add Player</button>
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
                        const response = await fetch('/api/league/add', {
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
        fetch('/api/league/squad', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, league})
        })
            .then(response => response.json())
            .then(async (json) =>{
                try {
                    const players = [];
                    const result = await fetch('/api/players/all', {
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
                        page.push(<Add current={refresh} refresh={setRefresh}/>);
                        setContent(page);
                    }
                    else
                    {
                        setContent(<Add current={refresh} refresh={setRefresh}/>);
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