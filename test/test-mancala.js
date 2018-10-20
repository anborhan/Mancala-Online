'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const mancala = require('../mancala/mancalaRouter');
const { DATABASE_URL } = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);

describe("Mancala Game", function () {

    let gameID;
    let playerOne;
    let playerTwo;
    let finishedGameID;

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .post('/mancala/startgame')
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                gameID = gameObject._id
                playerOne = gameObject.players[0]._id;
                console.log(playerOne)
            })

    });

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .put('/mancala/startgame/' + gameID)
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                playerTwo = gameObject.players[1]._id;
                console.log({gameID, playerOne, playerTwo})
            })

    });

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .post('/mancala/startgame')
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                gameObject.gameState.gameBoard = [0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 10]
                finishedGameID = gameObject._id
            })

    });

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .put('/mancala/startgame/' + finishedGameID)
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                console.log({gameID, playerOne, playerTwo})
            })

    });


    after(function () {
        return closeServer();
    });

    
    describe("Mancala", function () {

        describe("POST", function () {
            it('should return the Game Schema results', function () {
                return chai
                    .request(app)
                    .post('/mancala/startgame')
                    .then(function (res) {
                        // expect
                        expect(res).to.have.status(200);

                    });
            })
        })

        //Need to remove once a proper user authentication is in place
        describe("PUT", function () {
            it('should reject users with a missing pocket', function () {

                return chai
                    .request(app)
                    .put('/mancala')
                    .send({
                        playerID: playerOne,
                    })
                    .then(function (res) {
                        // expect
                        expect(res).to.have.status(400);
                    });
            })

            it('should reject users with a missing playerID', function () {

                return chai
                    .request(app)
                    .put('/mancala')
                    .send({
                        pocket: 4,
                    })
                    .then(function (res) {
                        // expect
                        expect(res).to.have.status(400);
                    });
            })

            it('should reply that the game does not exist', function () {

                return chai
                    .request(app)
                    .put('/mancala')
                    .send({
                        pocket: 4,
                        playerID: "5bc192c7f36eec63f9a78222",
                        gameID: "5bc192c7f36eec63f9a782e1"
                    })
                    .then(function (res) {
                        // expect
                        expect(res).to.have.status(406);
                    });
            })

            it('should require more players', function () {

            })

            it('should tell the user are not a player in this game', function () {

            })

            it('should tell the player that the game is already over', function () {

            })

            it('should tell the player that it is not your turn', function () {

            })

            it('should tell the player they cannot pick their own mancala', function () {

            })

            it('should tell the player they cannot pick an opponent\'s pocket', function () {

            })
        })
        
    }) 
})