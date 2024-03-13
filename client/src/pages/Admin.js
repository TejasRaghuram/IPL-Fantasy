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
                const response = await fetch('/api/admin/verify', {
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
                                    const result = await fetch('/api/admin/add', {
                                        method: 'post',
                                        headers: {'Content-Type': 'application/json'},
                                        body: JSON.stringify({name, position})
                                    });
                                    if(result.ok)
                                    {
                                        document.getElementById('admin-player').value = '';
                                    }
                                }
                                else
                                {
                                    alert('Fill All Fields!');
                                }
                            }}>Add Player</button>
                            <button class='admin-button' onClick={async () => {

                            }}>Refresh</button>
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