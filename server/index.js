require('dotenv').config();

const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/user');
const playersRoutes = require('./routes/players');
const leagueRoutes = require('./routes/league');
const adminRoutes = require('./routes/admin');

const server = express();

server.use(cors());

server.use('/api/user', userRoutes);
server.use('/api/players', playersRoutes);
server.use('/api/league', leagueRoutes);
server.use('/api/admin', adminRoutes);

server.use(express.json());

server.listen(process.env.PORT, () => {
    console.log('listening');
});