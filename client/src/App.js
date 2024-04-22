import { useState } from 'react';
import { UserContext } from './UserContext.js'
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './pages/Layout.js';
import Home from './pages/Home.js';
import League from './pages/League.js';
import User from './pages/User.js';
import Players from './pages/Players.js';
import Profile from './pages/Profile.js';
import Login from './pages/Login.js';
import Signup from './pages/Signup.js';
import Admin from './pages/Admin.js';
import './App.css';

function App() {
  const [username, setUsername] = useState(null);

  return (
    <UserContext.Provider value={{ username: username, setUsername: setUsername }}>
      <HashRouter>
        <Routes>
          <Route path='/' element={<Layout/>}>
            <Route index element={<Home/>}/>
            <Route path=':league' element={<League/>}/>
            <Route path=':league/:username' element={<User/>}/>
            <Route path='players' element={<Players/>}/>
            <Route path='profile/:player' element={<Profile/>}/>
            <Route path='login' element={<Login/>}/>
            <Route path='signup' element={<Signup/>}/>
            <Route path='admin' element={<Admin/>}/>
          </Route>
        </Routes>
      </HashRouter>
    </UserContext.Provider>
  );
}

export default App;
