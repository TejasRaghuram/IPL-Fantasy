import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './../styles/League.css';

function User(props) {
    const navigate = useNavigate();
    const params = useParams();

    return(
        <div class='league-user-body' onClick={() => {
            navigate('/' + params.league + '/' + props.username)
        }}>
            <div class='league-user-rank-body'>
                <p class='league-user-rank'>1</p>
            </div>
            <p class='league-user-name'>{props.username}</p>
            <p class='league-user-points'>{props.points}</p>
        </div>
    );
}

function League() {
    const params = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState(<p>Loading...</p>);

    useEffect(() => {
        const league = params.league;
        fetch('https://ipl-fantasy-api.onrender.com/api/league/users', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({league})
        })
            .then(response => response.json())
            .then(json => {
                try {
                    const rank = (u1, u2) => {
                        return u2.points - u1.points;
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
                        rankings.push(<User rank={currentRank} username={json[i].username} points={json[i].points}/>);
                    }
                    setContent(rankings);
                } catch(error) {
                    navigate('/');
                }
            });
    }, [params.league, navigate]);

    return(
        <div id='league-content'>
            <h1>{params.league}</h1>
            {content}
        </div>
    );
}

export default League;