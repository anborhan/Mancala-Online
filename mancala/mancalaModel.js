mongoose.Schema({
    players: [{
        username: String,
    }],
    pockets: {
        type: Array,
        default: newGamePockets()
    },
    turn: {
        type: Number,
        default: 0
    },
    startTime: Date
})