const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const mancala = require('./mancalaModule');

const gameSchema = mongoose.Schema({
    players: [{
        username: String,
        nickname: String,
        IPAddress: String,
        //Token: String
    }],
    startTime: Date,
    gameState: {
        gameBoard: Array, 
        startingPlayer: Number, 
        currentPlayer: Number,
        turn: Number,
        gameOver: Boolean
    }
});
/*
gameSchema.methods.toJSON = function() {
    let obj = this.toObject();
    delete obj.players[0].Token;
    delete obj.players[1].Token;
    return obj;
   }*/

const Game = mongoose.model("Game", gameSchema);

module.exports = {Game};