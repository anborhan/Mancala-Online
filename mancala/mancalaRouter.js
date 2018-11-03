'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const router = express.Router();

const jsonParser = bodyParser.json();
const jwt = require('jsonwebtoken');
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
    const playerOneUrl = generateUrl(playerOneCode, hostUrl, "")
    const inviteCode = generateCode()
    const gameInviteForPlayerTwo = generateUrl(inviteCode, hostUrl, "/join")

    Game.create({
        players: [{
            username,
            nickname,
            IPAddress: req.ip,
            playerToken: playerOneCode
        }],
        gameInviteCode: inviteCode,
        startDate: new Date(),
        gameState: gameState,
    })
        .then(game => res.status(200).json(game))
        //{game, "Your Private Game Link": playerOneUrl, "Your Invite Code for Player Two": gameInviteForPlayerTwo}
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "something went wrong" })
        })
    
})

/*router.get('/join/:invitecode', (req, res) => {
    //user sets nickname
    //
}) */

//add player
router.put('/join/:invitecode', (req, res) => {
    //set nickname
    const username = (req.body && req.body.username) || req.query.username
    const nickname = (req.body && req.body.nickname) || req.query.nickname || "Player 2"

    let hostUrl = req.headers.host
    const playerTwoCode = generateCode();
    const playerTwoUrl = generateUrl(playerTwoCode, hostUrl, "");
    //function generatecode, check characters, return
    //generateCode, generateURL(req) ---- req.app
    //express request documentation page
    Game
        .findOne({ gameInviteCode: req.params.invitecode })
        .then(game => {
            if (!game) return res.status(406).json({ error: "This isn't a joinable game" });
           // if (req.ip === game.players[0].IPAddress) return res.status(406).json({ error: "You're already in this game!"})
            if (game.players.length !== 1) return res.status(406).json({ error: "There are too many players in this game!" });   
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
        .then(game => res.status(200).json(game))
        //{"Your Game URL": playerTwoUrl, game}
    .catch(err => {
        console.log(err);
        res.status(500).json({ error: "Something went wrong!" })
    })
})

module.exports = router;