const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const playerSchema = mongoose.Schema({
    username: String,
    nickname: String,
    IPAddress: String,
    playerToken: String,
});

playerSchema.methods.serialize = function (playerCode) {
    if (this.playerToken = playerCode) {
        return {
            username: this.username,
            nickname: this.nickname,
            playerToken: this.playerToken
        }
    } else return {
        username: this.username,
        nickname: this.nickname
    }
}

const gameSchema = mongoose.Schema({
    players: [playerSchema],
    gameInviteCode: String,
    gameInviteUrl: String,
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

gameSchema.methods.serialize = function (playerCode) {
    return {
        players: this.players.map(player => player.serialize(playerCode)),
        gameInviteCode: this.gameInviteCode, 
        gameInviteUrl: this.gameInviteUrl,
        startTime: this.startTime,
        lastModified: this.lastModified,
        gameState: this.gameState,
        _id: this._id
    }
}

const Game = mongoose.model("Game", gameSchema);

module.exports = {Game};