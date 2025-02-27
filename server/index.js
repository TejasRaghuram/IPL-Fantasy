require('dotenv').config();

const express = require('express');
const cors = require('cors');

const server = express();

server.use(cors);

server.use(express.json());

server.listen(process.env.PORT, () => {
    console.log('listening');
});