import { useState, useEffect } from 'react';
import './../styles/Players.css';

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

function Players() {
    const [players, setPlayers] = useState(<p>Loading...</p>);

    useEffect(() => {
        fetch('https://ipl-fantasy-api.onrender.com/api/players/all')
            .then(response => response.json())
            .then(json => {
                const rank = (p1, p2) => {
                    return p2.points - p1.points;
                };
                json.sort(rank);
                const rankings = [];
                let currentRank = 1;
                let currentPoints = json[0].points;
                for(let i = 0; i < json.length; i++)
                {
                    if(json[i].points < currentPoints)
                    {
                        currentRank++;
                        currentPoints = json[i].points;
                    }
                    rankings.push(<Player rank={currentRank} name={json[i].name} points={json[i].points}/>);
                }
                setPlayers(rankings);
            });
    }, []);

    return(
        <div id='players-content'>
            <h1>Player Rankings</h1>
            {players}
        </div>
    );
}

export default Players;