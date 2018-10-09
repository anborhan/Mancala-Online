'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const jsonParser = bodyParser.json();

mancalaRouter.post('/', (req, res, ) => { 
    
//new game
Game.create( {
    players: [
        newPlayer(1),
        newPlayer(2)
    ],
})

function newPlayer(playerNum) {
    const playerOffset = (POCKETS_PER_PLAYER+MANCALAS_PER_PLAYER) * (playerNum-1)
    return {
        username: username || "Player" + playerNum,
       // pockets: masterArray.slice(playerOffset, playerOffset + POCKETS_PER_PLAYER-1),
       // score: playerOffset + POCKETS_PER_PLAYER + MANCALAS_PER_PLAYER - 1
    }
}

})