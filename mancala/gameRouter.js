'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

//change mancalaRouter to mancalaAPIRouter (machine facing) and make a new mancalaRouter which is used for setting a nickname, the main Mancala menu, homepage, etc.

const mancala = require('./mancalaModule');
const { Game } = require('./mancalaModel');

const { DATABASE_URL, PORT } = require('../config');

router.get('/:playercode', (req, res) => {
    let game;
    let reqPlayerIndex
    Game
        .findOne({ "players.playerToken": req.params.playercode })
        .then(_game => {
            game = _game;
            if (!game) {
                console.log("Thrown Error")
                let err = new Error("This isn't a joinable game");
                err.code = 404;
                return Promise.reject(err);
            }
            reqPlayerIndex = game.players.findIndex(player => player.playerToken === req.params.playercode)
        })
        .then(_game => {
            let playerToken = game.players[reqPlayerIndex].playerToken;
            console.log(playerToken)
            //redirect
            res.redirect(`/#${playerToken}`)
        })
})


module.exports = router;