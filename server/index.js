require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models');

const userRoutes = require('./routes/user');
const playersRoutes = require('./routes/players');
const leagueRoutes = require('./routes/league');
const adminRoutes = require('./routes/admin');

const server = express();

server.use(cors());
server.use(express.json());

server.use('/api/user', userRoutes);
server.use('/api/players', playersRoutes);
server.use('/api/league', leagueRoutes);
server.use('/api/admin', adminRoutes);

const connect = async () => {
    try {
        await sequelize.authenticate();
        console.log('connected');
    } catch(error) {
        console.log('connection failed');
    }
}

(async () => {
    await connect();

    server.listen(process.env.PORT, () => {
        console.log('listening');
    });
})();