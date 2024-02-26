import { useState } from 'react';
import './../styles/Admin.css';

function Match(props)
{
    return(
        <div class='admin-fixture'>
            <h3 class='admin-match'>{props.fixture}</h3>
            <p class='admin-match'>{props.status}</p>
            <p class='admin-match'>{props.id}</p>
            <button class='admin-add' onClick={() => {
                // add match
            }}>Add Match</button>
        </div>
    );
}

function Admin()
{
    const [content, setContent] = useState();

    return(
        <div id='admin-content'>
            <h2 id='admin-prompt'>Enter Password: </h2>
            <input id='admin-password' type='password' name='password'></input>
            <button id='admin-submit' onClick={async () => {
                setContent(<p>Loading...</p>);
                const password = document.getElementById('admin-password').value;
                const response = await fetch('/api/admin/verify', {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({password})
                });
                if(response.ok)
                {
                    const response = await fetch('/api/admin/matches');
                    const json = await response.json();
                    const matches = [];
                    matches.push(<h1>Welcome, Admin</h1>)
                    for(let i = 0; i < json.length; i++)
                    {
                        const match = json[i].team1 + ' vs ' + json[i].team2;
                        const result = json[i].status;
                        const id = json[i].id;
                        matches.push(<Match fixture={match} status={result} id={id}/>)
                    }
                    setContent(matches);
                }
                else
                {
                    setContent();
                }
            }}>Submit</button>
            <div id='admin-portal'>
                {content}
            </div>
        </div>
    );
}

export default Admin;