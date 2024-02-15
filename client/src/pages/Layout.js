import { Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from './../UserContext.js';
import Logo from './../images/Logo.png';
import './../styles/Layout.css';

function Navbar() {
    const user = useContext(UserContext);
    const navigate = useNavigate();

    if(user.username != null)
    {
        return(
            <div>
                <div id='layout-navbar'>
                    <img id='layout-navbar-logo' src={Logo} alt=''/>
                    <p class='layout-navbar-link' onClick={() => {
                        navigate('/');
                    }}>Home</p>
                    <p class='layout-navbar-link' onClick={() => {
                        navigate('/players');
                    }}>Player Rankings</p>
                    <button id='layout-logout' onClick={() => {
                        user.setUsername(null);
                        navigate('/login');
                    }}>Log Out</button>
                </div>
                <div id='layout-buffer'/>
            </div>
        );
    }
    else
    {
        return(
            <div/>
        );
    }
}

function Footer() {
    return (
        <p id='layout-footer'>Designed and Developed by Tejas Raghuram. Rules by Kaushal Krishnamurthy.</p>
    );
}

function Layout() {
    return(
        <div>
            <Navbar/>
            <Outlet/>
            <Footer/>
        </div>
    );
}

export default Layout;