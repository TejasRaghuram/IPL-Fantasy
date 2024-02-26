import { useState, useEffect } from 'react';
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

function User() {
    let params = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(<p>Loading...</p>)

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
                        const rankings = [];
                        let currentRank = 1;
                        let currentPoints = players[0].points;
                        for(let i = 0; i < players.length; i++)
                        {
                            if(players[i].points < currentPoints)
                            {
                                currentRank++;
                                currentPoints = json[i].points;
                            }
                            rankings.push(<Player rank={currentRank} name={players[i].name} points={players[i].points}/>);
                        }
                        setContent(rankings);
                    }
                    else
                    {
                        setContent();
                    }
                } catch(error) {
                    navigate('/');
                }
            });
    }, [params.username, params.league, navigate]);

    return(
        <div id='user-content'>
            <h2>{params.league}</h2>
            <h1>{params.username}</h1>
            {content}
        </div>
    );
}

export default User;