const express = require ('express');
const morgan = require('morgan');
const bodyParser = require ('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const jsonParser = bodyParser.json();
const app = express();


app.use(morgan('common'));

schema.statics.protectGameMoves = function(req, res, next) {
    console.log("Checking if the player can access this game");
    const err = {
        message: "You're not in this game!"
    };
}