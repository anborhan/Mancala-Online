'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const mancala = require('../mancala/mancalaAPIRouter');
const { DATABASE_URL } = require('../config');
const { Game } = require('../mancala/mancalaModel');


const expect = chai.expect;
chai.use(chaiHttp);

describe("Mancala Setup", function () {
    let gameObject;

    before(function () {
        return runServer(DATABASE_URL)

    })

    after(function () {
        return closeServer();
    });

    describe("Creating a Game", function () {
        it('should create a game', function () {
            return chai
                .request(app)
                .post('/mancala/')
                .then(function (res) {
                    gameObject = res.body
                    console.log(JSON.stringify({gameObject}))
                    expect(res).to.have.status(200);
                })
        })
    })

    describe("Starting the Game", function () {
        it('should return the Game Schema results', function () {
            return chai
                .request(app)
                .post('/mancala/')
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(200);
                });
        })
    })

    describe("Mancala Game without Second Player", function () {
        it('should tell the user there are not enough players', function () {
            let playerOneToken;
            playerOneToken = gameObject.players[0].playerToken;

            return chai
                .request(app)
                .put('/mancala/' + playerOneToken)
                .send({
                    pocket: 4,
                })
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(406);
                });
        })
    })

    describe("A Game that Doesn't Exist", function () {
        it('should reply that the game does not exist', function () {

            return chai
                .request(app)
                .get('/mancala/join/' + "Notarealgame")
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(404);
                });
        })
    })

    describe("Adding a Second Player", function () {
        it('should return the Game Schema results', function () {

            let gameInviteCode;
            gameInviteCode = gameObject.gameInviteCode
            console.log(gameInviteCode)
            return chai
                .request(app)
                .get('/mancala/join/' + gameInviteCode)
                .then(function (res) {
                    // expect
                    console.log("Second Player Test:" + gameObject)
                    expect(res).to.have.status(200);

                });
        })
    })
})

describe("Mancala Game", function () {
    let gameObject
    let playerOneToken;
    let playerTwoToken

    before(function () {
        return runServer(DATABASE_URL);
    })

    after(function () {
        return closeServer();
    });

    describe("Creating a Game", function () {
        it('should create a game', function () {

            return chai
                .request(app)
                .post('/mancala')
                .then(function (res) {
                    gameObject = res.body
                    playerOneToken = gameObject.players[0].playerToken;
                    expect(res).to.have.status(200);
                })
        })
    });

    describe("Add a Second Player to the Game", function () {
        it('should add a second player', function () {
            let gameInviteCode
            gameInviteCode = gameObject.gameInviteCode

            return chai
                .request(app)
                .get('/mancala/join/' + gameInviteCode)
                .then(function (res) {
                    gameObject = res.body
                    playerTwoToken = gameObject.players[1].playerToken;
                    expect(res).to.have.status(200);
                })
        })
    });

    //Need to remove once a proper user authentication is in place
    describe("Mancala Turn Submitting Errors", function () {
        it('should reject users with a missing pocket', function () {

            return chai
                .request(app)
                .put('/mancala/' + playerOneToken)
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(406);
                });
        })

        it('should tell the player that it is not your turn', function () {
            return chai
                .request(app)
                .put('/mancala/' + playerTwoToken)
                .send({
                    "pocket": 3
                })
                .then(function (res) {
                    expect(res).to.have.status(406);
                })
        })

        it('should tell the player they cannot pick their own mancala', function () {
            return chai
                .request(app)
                .put('/mancala/' + playerOneToken)
                .send({
                    "pocket": 7
                })
                .then(function (res) {
                    expect(res).to.have.status(406);
                })
        })

        it('should tell the player they cannot pick an opponent\'s pocket', function () {
            return chai
                .request(app)
                .put('/mancala/' + playerOneToken)
                .send({
                    "pocket": 13
                })
                .then(function (res) {
                    expect(res).to.have.status(406);
                })
        })

    })

    describe("Mancala Turns Properly Taken", function () {

        it('should properly take Player One\'s turn', function () {
            return chai
                .request(app)
                .put('/mancala/' + playerOneToken)
                .send({
                    "pocket": 2
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                })
        })
        it('should properly take Player Two\'s turn', function () {
            return chai
                .request(app)
                .put('/mancala/' + playerTwoToken)
                .send({
                    "pocket": 9
                })
                .then(function (res) {
                    expect(res).to.have.status(200);
                })
        })
    })
})

describe("Mancala Game after Ending", function () {
    let gameObject
    let playerOneFinishedGameToken;

    before(function () {
        return runServer(DATABASE_URL)
    })

    after(function () {
        return closeServer();
    });


    describe("Creating a Game", function () {
        it('should create a game', function () {
            return chai
                .request(app)
                .post('/mancala/')
                .then(function (res) {
                    gameObject = res.body
                    playerOneFinishedGameToken = gameObject.players[0].playerToken;
                    expect(res).to.have.status(200);
                })
        })
    })

    describe("Add a Second Player to the Game", function () {
        it('should add a second player', function () {
            let finishedGameInvite;
            finishedGameInvite = gameObject.gameInviteCode;

            return chai
                .request(app)
                .get('/mancala/join/' + finishedGameInvite)
                .then(function (res) {
                    gameObject = res.body
                    expect(res).to.have.status(200);
                })
        })
    })

    describe("An Endgame Board", function () {
        it('should change the gameBoard to an endgame scenario', function () {

            let finishedGameID;
            finishedGameID = gameObject._id;

            return Game

                .findByIdAndUpdate(finishedGameID,
                    {
                        $set: {
                            "gameState.gameBoard": [0, 0, 0, 0, 0, 2, 5, 4, 3, 2, 5, 1, 0, 15],
                        }
                    }, { new: true }
                ).then(function (res) {
                    expect(res.gameState.gameBoard).to.eql([0, 0, 0, 0, 0, 2, 5, 4, 3, 2, 5, 1, 0, 15]);
                    expect(res).to.be.an("object")
                })
        })
    })

    describe("Mancala Game when last turn is taken", function () {
        it('should prepare the final turn', function () {

            return chai
                .request(app)
                .put('/mancala/' + playerOneFinishedGameToken)
                .send({
                    "pocket": 6
                })
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res).to.be.an("object")
                })
        });
    })
})