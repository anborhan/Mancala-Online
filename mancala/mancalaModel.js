const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mancala = require('./mancalaModule');

const gameSchema = mongoose.Schema({
    players: [{
        username: String,
        nickname: String,
        IPAddress: String,
        playerToken: String
    }],
    gameInviteCode: String,
    startTime: {
        type: Date,
        default: Date.now
    },
    lastModified: Date,
    gameState: {
        gameBoard: Array, 
        startingPlayer: Number, 
        currentPlayer: Number,
        turn: Number,
        gameOver: Boolean
    }
});

const Game = mongoose.model("Game", gameSchema);

module.exports = {Game};