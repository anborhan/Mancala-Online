'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const faker = require('faker');

//change mancalaRouter to mancalaAPIRouter (machine facing) and make a new mancalaRouter which is used for setting a nickname, the main Mancala menu, homepage, etc.

const mancala = require('./mancalaModule');
const { Game } = require('./mancalaModel');

const { DATABASE_URL, PORT } = require('../config');

function generateCode() {
    const playerString = faker.fake("{{hacker.adjective}}{{company.bsAdjective}}{{company.catchPhraseNoun}}");
    let updatedPlayerCode = playerString.replace(/\W/g, '')
    return updatedPlayerCode;
}

function generateUrl(code, url, join) {
    let newUrl = `${url}${join}/${code}`
    return newUrl
}



//startgame
router.post('/', (req, res) => {

    const username = (req.body && req.body.username) || req.query.username
    const nickname = (req.body && req.body.nickname) || req.query.nickname || "Player 1"

    let gameState = mancala.startGame();
    //    res.status(201).json(gameState)

    //serialize! (players object - return sanitized version players.map)
    //know if it's hosted at /mancala base off of req.url
    let hostUrl = req.headers.host
    const playerOneCode = generateCode()
    const inviteCode = generateCode()
    const gameInviteForPlayerTwo = generateUrl(inviteCode, hostUrl, "/join")

    Game.create({
        players: [{
            username,
            nickname,
            IPAddress: req.ip,
            playerToken: playerOneCode,
        }],
        gameInviteCode: inviteCode,
        gameInviteUrl: gameInviteForPlayerTwo,
        startDate: new Date(),
        gameState: gameState,
    })
        .then(game => {
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

//add player
router.get('/join/:invitecode', (req, res) => {
    //set nickname
    const username = req.query.username
    const nickname = req.query.nickname || "Player 2"

    const playerTwoCode = generateCode();
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
                    playerToken: playerTwoCode
                }
            );

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

module.exports = router;