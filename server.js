const express = require ('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require ('body-parser');

const jsonParser = bodyParser.json();
const app = express();

const mancalaRouter = require('api/mancala/', mancalaRouter);