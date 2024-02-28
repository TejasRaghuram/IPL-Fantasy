import { useState, useContext, useEffect } from 'react';
import { UserContext } from './../UserContext.js';
import { useParams, useNavigate } from 'react-router-dom';
import './../styles/User.css';

function Player(props) {
    const [image, setImage] = useState('https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4');

    const check = new Image();
    check.src = "https://scores.iplt20.com/ipl/playerimages/" + props.name.replaceAll(' ', '%20') + '.png';
    check.onload = () => {
        setImage(check.src);
    };

    return(
        <div class='player-body'>
            <div class='player-rank-body'>
                <p class='player-rank'>{props.rank}</p>
            </div>
            <img class='player-image' src={image} alt=''/>
            <p class='player-name'>{props.name}</p>
            <p class='player-points'>{props.points}</p>
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
                    for(let i = 0; i < json.players.length; i++)
                    {
                        const name = json.players[i];
                        const result = await fetch('/api/players/points', {
                            method: 'post',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({name})
                        });
                        const points = await result.json();
                        players.push({
                            name: name,
                            points: points
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
                                currentPoints = json[i].points;
                            }
                            page.push(<Player rank={currentRank} name={players[i].name} points={players[i].points}/>);
                        }
                        page.push(<Add current={refresh} refresh={setRefresh}/>);
                        setContent(page);
                    }
                    else
                    {
                        setContent(<Add current={refresh} refresh={setRefresh}/>);
                    }
                } catch(error) {
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