import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './../UserContext.js';
import Load from './../images/Load.png';
import './../styles/Home.css';

function League(props) {
    const navigate = useNavigate();

    return(
        <p class='home-league' onClick={() =>{
            navigate('/' + props.name);
        }}>{props.name}</p>
    );
}

function Create() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    return(
        <div>
            <form id='home-join-form'>
                <label for='league-name'>League Name:</label>
                <br/>
                <input id='home-create-name' class='home-input' type='text' name='league-name'/>
                <br/>
                <br/>
                <label for='league-password'>League Password:</label>
                <br/>
                <input id='home-create-password' class='home-input' type='password' name='league-password'/>
                <br/>
                <input id='home-submit' type='button' value='Submit' onClick={async () => {
                    const name = document.getElementById('home-create-name').value;
                    const password = document.getElementById('home-create-password').value;
                    const response = await fetch('https://ipl-fantasy-api.onrender.com/api/user/create', {
                        method: 'post',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({name, password})
                    });
                    
                    if(response.ok)
                    {
                        const username = user.username;
                        await fetch('https://ipl-fantasy-api.onrender.com/api/user/join', {
                            method: 'post',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({username, name, password})
                        });
                        navigate('/' + name);
                    }
                    else
                    {
                        const json = await response.json();
                        alert(json.error);
                    }
                }}/>
            </form>
        </div>
    );
}

function Join() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    return(
        <div>
            <form id='home-join-form'>
                <label for='league-name'>League Name:</label>
                <br/>
                <input id='home-join-name' class='home-input' type='text' name='league-name'/>
                <br/>
                <br/>
                <label for='league-password'>League Password:</label>
                <br/>
                <input id='home-join-password' class='home-input' type='password' name='league-password'/>
                <br/>
                <input id='home-submit' type='button' value='Submit' onClick={async () => {
                    const username = user.username;
                    const name = document.getElementById('home-join-name').value;
                    const password = document.getElementById('home-join-password').value;
                    const response = await fetch('https://ipl-fantasy-api.onrender.com/api/user/join', {
                        method: 'post',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({username, name, password})
                    });
                    
                    if(response.ok)
                    {
                        navigate('/' + name);
                    }
                    else
                    {
                        const json = await response.json();
                        alert(json.error);
                    }
                }}/>
            </form>
        </div>
    );
}

function Home() {
    const user = useContext(UserContext);
    const [content, setContent] = useState(<p>Loading...</p>);
    const [create, setCreate] = useState(false);
    const [join, setJoin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const username = user.username;
        fetch('https://ipl-fantasy-api.onrender.com/api/user/leagues', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username})     
        })
            .then(response => response.json())
            .then(json => {
                const leagues = [];
                for(let i = 0; i < json.length; i++)
                {
                    leagues.push(<League name={json[i].league}/>);
                }
                setContent(leagues);
            });
    }, [user.username]);

    if(user.username == null)
    {
        return(
            <img src={Load} alt='' onLoad={() => {
                navigate('/login');
            }}/>
        );
    }
    else
    {
        return(
            <div id='home-content'>
                <h1>Welcome, {user.username}</h1>
                <h2 id='home-league-header'>Your Leagues</h2>
                {content}
                <button class='home-button' onClick={() => {
                    setCreate(!create);
                }}>Create a League</button>
                {create && <Create/>}
                <button class='home-button' onClick={() => {
                    setJoin(!join);
                }}>Join a League</button>
                {join && <Join/>}
            </div>
        );
    }
}

export default Home;