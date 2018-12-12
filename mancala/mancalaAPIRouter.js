'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const faker = require('faker');

const jsonParser = bodyParser.json();

//change mancalaRouter to mancalaAPIRouter (machine facing) and make a new mancalaRouter which is used for setting a nickname, the main Mancala menu, homepage, etc.

const mancala = require('./mancalaModule');
const { Game } = require('./mancalaModel');

function generateCode() {
    const playerString = faker.fake("{{hacker.adjective}}{{company.bsAdjective}}{{company.catchPhraseNoun}}");
    let updatedPlayerCode = playerString.replace(/\W/g, '')
    return updatedPlayerCode;
}

function generateUrl(code, url, join) {
    let newUrl = `${url}${join}/${code}`
    return newUrl;
}

function generateRejoinUrl(code, url, mancala) {
    let newUrl = `${url}${mancala}${code}`
    return newUrl;
}

//startgame
router.post('/', (req, res) => {

    const username = (req.body && req.body.username) || req.query.username
    const nickname = (req.body && req.body.nickname) || req.query.nickname || "Player One"

    let gameState = mancala.startGame();
    //    res.status(201).json(gameState)
    console.log(req.body)
    //serialize! (players object - return sanitized version players.map)
    //know if it's hosted at /mancala base off of req.url
    let hostUrl = req.headers.host
    const playerOneCode = generateCode()
    const inviteCode = generateCode()
    const gameInviteForPlayerTwo = generateUrl(inviteCode, hostUrl, "/mancala/join")
    const gameRejoinLink = generateRejoinUrl(playerOneCode, hostUrl, "/game/")
    console.log(gameRejoinLink)
    Game.create({
        players: [{
            username,
            nickname,
            IPAddress: req.ip,
            playerToken: playerOneCode,
            gameRejoinUrl: gameRejoinLink,
        }],
        gameInviteCode: inviteCode,
        gameInviteUrl: gameInviteForPlayerTwo,
        startDate: new Date(),
        gameState: gameState,
    })
        .then(game => {
            console.log(game)
            let serialized = game.serialize(playerOneCode);
            res.status(200).json(serialized)})
        // {game: game.serialize(), "Your Private Game Link": playerOneUrl, "Your Invite Code for Player Two": gameInviteForPlayerTwo}
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "something went wrong" })
        })
    
})

router.put('/rename/:nickname', (req, res) => {
    Game
        .findOneAndUpdate({ "players.playerToken": req.body.playerToken}, {$set: {"players.$.nickname": req.query.nickname}}, {new: true})
        .then(game => res.status(200).json(game.serialize(playerOneCode)))
})

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
            console.log(game)
            console.log(playerToken)
            res.status(200).json(game.serialize(playerToken))
        })
})

//add player
router.get('/join/:invitecode', (req, res) => {
    //set nickname
    const username = req.query.username
    const nickname = req.query.nickname || "Player Two"
    let hostUrl = req.headers.host
    const playerTwoCode = generateCode();
    const gameRejoinLink = generateRejoinUrl(playerTwoCode, hostUrl, "/game/")
    //function generatecode, check characters, return
    //generateCode, generateURL(req) ---- req.app
    //express request documentation page
    let gameResponse;
    let game;
    Game
        .findOne({ gameInviteCode: req.params.invitecode })
        .then(_game => {
            game = _game;
            if (!game) {
                console.log("Thrown Error")
                let err = new Error("This isn't a joinable game");
                err.code = 404;
                return Promise.reject(err);
            }
           // if (req.ip === game.players[0].IPAddress) return res.status(406).json({ error: "You're already in this game!"})
            if (game.players.length !== 1) {
                let err = new Error("There are too many players in this game!");
                err.code = 406;
                return Promise.reject(err);
            }
            game.players.push({
                    username,
                    nickname,
                    IPAddress: req.ip,
                    playerToken: playerTwoCode,
                    gameRejoinUrl: gameRejoinLink,
                }
            )
            game.gameInviteCode = undefined;
            return game.save();
        })
        .then(_game => res.status(200).json(game.serialize(playerTwoCode)))
        //need to fix this
        //{game: game.serialize(playerTwoCode), "Your Game URL": playerTwoUrl}
    .catch(err => {
        console.log(err);
        res.status(err.code || 500).json({ error: err.message || "Something went wrong!" })
    })
})

router.get('/:id', (req, res) => {
    Game
        .findOne({ _id: req.params.id })
        .then(game => res.status(200).json(game.serialize()))
})

//take turn
router.put('/:playercode', jsonParser, (req, res) => {
    //check that all fields are filled in request form
    console.log(req.body)
    const requiredFields = ["pocket"];
    let missingPocketErr = false;
    console.log("Yo!")
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            missingPocketErr = true;
            console.error(message);
        }
    });
    let result;
    Game
        //find a game based on user's request
        .findOne({ "players.playerToken": req.params.playercode })
        .then(game => {
            if (missingPocketErr) return res.status(406).json({ error: "Missing Pockets in Request Body" })
            if (!game) return res.status(406).json({ error: "No game found!" });
            if (game.gameOver) return res.status(/*422*/ 423).json({ error: "This game is already over!" })
            //check if two players are playing (it is impossible for a game to have more than 2)
            if (!game.players || game.players.length !== 2) return res.status(406).json({ error: "Not enough players!" });
            let reqPlayerIndex = game.players.findIndex(player => player.playerToken === req.params.playercode)
            if (reqPlayerIndex < 0) return res.status(406).json({ error: "You're not in this game!" });
            if (reqPlayerIndex + 1 !== game.gameState.currentPlayer) return res.status(406).json({ error: "It's not your turn!" })

            result = (mancala.takeTurn(game.gameState.currentPlayer, req.body.pocket, game.gameState))
            if (result.error) return res.status(406).json({ error: result.error });
            let gameResult;
            if (result.gameOver) {
                gameResult = "The game is over!"
                if (result.winner === reqPlayerIndex + 1) gameResult += " You won!";
                else if (result.tie) gameResult += " It was a tie!";
                else gameResult += " You lost!";
            }
            //Turn is taken (everything went correctly)
            game.gameState = result;
            game.lastModified = Date.now();
            game.save().then(() => {
                if (game.gameOver) {
                    game.gameState.currentPlayer = undefined;
                    game.gameState.scores = result.scores;
                    game.gameState.numberOfTurns = game.gameState.turn;
                    game.gameState.turn = undefined;
                    game.gameState.results = `${gameResult}`;
                    game.gameState.tie = result.tie;
                }
                game.gameState.lastPocket = req.body.pocket;
                game.gameState.startingPlayer = undefined;
                console.log({ "game": game })
                return res.status(200).json(game.serialize(req.params.playercode));

                //end of success code
            }).catch(err => {
                console.error(err);
                res.status(500).json({ error: "Something went wrong!" })
            })
        }).catch(err => {
            console.error(err);
            res.status(404).json({ error: 'Could not find game with this ID' });
        });


})

module.exports = router;