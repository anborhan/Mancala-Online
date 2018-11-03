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

//view game
router.get('/:id', (req, res) => {
    Game
        .findOne({ _id: req.params.id })
        .then(game => res.status(200).json(game))
})

//take turn
router.put('/:playercode', jsonParser, (req, res) => {
    //check that all fields are filled in request form
    const requiredFields = ['pocket'];
    let check = false;
    requiredFields.forEach(field => {
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            check = true;
            console.error(message);
            return res.status(400).send(message);
        }
    });
    console.log("Not supposed to happen!")
    let result;
    Game
        //find a game based on user's request
        .findOne({ "players.playerToken": req.params.playercode })
        .then(game => {
            if (check) return res.status(406).json({error: "Missing Pockets in Request Body"})
            if (!game) return res.status(406).json({ error: "No game found!" });
            if (game.gameOver) return res.status(/*422*/ 423).json({ error: "This game is already over!" })
            //check if two players are playing (it is impossible for a game to have more than 2)
            if (!game.players || game.players.length !== 2) return res.status(406).json({ error: "Not enough players!" });
            let reqPlayerIndex = game.players.findIndex( player => player.playerToken === req.params.playercode)
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
                    game.gameState.numberOfTurns = game.gameState.turn - 1;
                    game.gameState.turn = undefined;
                    game.gameState.Results = gameResult;
                }
                game.gameState.startingPlayer = undefined;
                return res.status(200).json(game.gameState);

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




//router.route or router.use

/* mancala.takeTurn(game.gameState.currentPlayer, req.gameState.pocketChoice, game.gameState)
         }
     }).then(game => res.status(250).json(game))
 
 
(err, game) => {
     if (err) {
         console.log(err)
         return res.status(500).json({Message: "There was an error"})
     }
     res.json(game);
 })*/


module.exports = router;