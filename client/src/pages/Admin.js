import { useState } from 'react';
import './../styles/Admin.css';

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
                const response = await fetch('https://ipl-fantasy-api.onrender.com/api/admin/verify', {
                    method: 'post',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({password})
                });
                if(response.ok)
                {
                    setContent(
                        <div>
                            <h1>Welcome, Admin</h1>
                            <h3 class='admin-element'>Add Player</h3>
                            <input id='admin-player' class='admin-text' type='text' placeholder='Name'/>
                            <input id='admin-position' class='admin-text' type='text' placeholder='Position'/>
                            <button class='admin-add' onClick={async () => {
                                const name = document.getElementById('admin-player').value;
                                const position = document.getElementById('admin-position').value;
                                if(name.length > 0 && position.length > 0)
                                {
                                    const result = await fetch('https://ipl-fantasy-api.onrender.com/api/admin/add', {
                                        method: 'post',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({name, position})
                                    });
                                    if(result.ok)
                                    {
                                        document.getElementById('admin-player').value = '';
                                    }
                                    else
                                    {
                                        const json = await result.json();
                                        alert(json.error);
                                    }
                                }
                                else
                                {
                                    alert('Fill All Fields!');
                                }
                            }}>Add Player</button>
                            <h3 class='admin-element'>Add Man of the Match</h3>
                            <input id='admin-man-of-match' class='admin-text' type='text' placeholder='Name'/>
                            <button class='admin-add' onClick={async () => {
                                const name = document.getElementById('admin-man-of-match').value;
                                if(name.length > 0)
                                {
                                    const result = await fetch('https://ipl-fantasy-api.onrender.com/api/admin/man_of_match', {
                                        method: 'post',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({name})
                                    });
                                    if(result.ok)
                                    {
                                        document.getElementById('admin-man-of-match').value = '';
                                        alert('Success!');
                                    }
                                    else
                                    {
                                        const json = await result.json();
                                        alert(json.error);
                                    }
                                }
                                else
                                {
                                    alert('Fill All Fields!');
                                }
                            }}>Add Man of the Match</button>
                            <h3 class='admin-element'>Add Hat Trick</h3>
                            <input id='admin-hat-trick' class='admin-text' type='text' placeholder='Name'/>
                            <button class='admin-add' onClick={async () => {
                                const name = document.getElementById('admin-hat-trick').value;
                                if(name.length > 0)
                                {
                                    const result = await fetch('https://ipl-fantasy-api.onrender.com/api/admin/hat_trick', {
                                        method: 'post',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({name})
                                    });
                                    if(result.ok)
                                    {
                                        document.getElementById('admin-hat-trick').value = '';
                                        alert('Success!');
                                    }
                                    else
                                    {
                                        const json = await result.json();
                                        alert(json.error);
                                    }
                                }
                                else
                                {
                                    alert('Fill All Fields!');
                                }
                            }}>Add Hat Trick</button>
                            <button class='admin-button' onClick={async () => {
                                const result = await fetch('http://localhost:4000/api/admin/refresh_points', {
                                    method: 'get',
                                    headers: {'Content-Type': 'application/json'}
                                });
                                if(result.ok)
                                {
                                    alert('Success!')
                                }
                                else
                                {
                                    const json = await result.json();
                                    alert(json.error);
                                }
                            }}>Refresh Points</button>
                            <button class='admin-button' onClick={async () => {
                                const result = await fetch('http://localhost:4000/api/admin/refresh', {
                                    method: 'get',
                                    headers: {'Content-Type': 'application/json'}
                                });
                                if(result.ok)
                                {
                                    alert('Success!')
                                }
                                else
                                {
                                    const json = await result.json();
                                    alert(json.error);
                                }
                            }}>Refresh Data</button>
                            <button class='admin-button' onClick={async () => {
                                const result = await fetch('http://localhost:4000/api/admin/update', {
                                    method: 'get',
                                    headers: {'Content-Type': 'application/json'}
                                });
                                if(result.ok)
                                {
                                    alert('Success!')
                                }
                                else
                                {
                                    const json = await result.json();
                                    alert(json.error);
                                }
                            }}>Update</button>
                        </div>
                    );
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