require('dotenv').config();

const express = require('express');

const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');
const playersRoutes = require('./routes/players');
const userRoutes = require('./routes/user');
const leagueRoutes = require('./routes/league');

const server = express();

server.use(express.json());

server.use('/api/account', accountRoutes);
server.use('/api/admin', adminRoutes);
server.use('./api/players', playersRoutes);
server.use('./api/user', userRoutes);
server.use('./api/league', leagueRoutes);