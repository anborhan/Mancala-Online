'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const mancala = require('../mancala/mancalaRouter');
const { DATABASE_URL } = require('../config');
const { Game } = require('../mancala/mancalaModel');


const expect = chai.expect;
chai.use(chaiHttp);

describe("Mancala Setup", function () {
    let gameInviteCode;
    let playerOneToken

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .post('/mancala/')
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                console.log(gameObject)
                gameInviteCode = gameObject.gameInviteCode
                playerOneToken = gameObject.players[0].playerToken;
                console.log("gameInvite: " + gameInviteCode)
            })
        })
            
    after(function () {
        return closeServer();
    });

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
                .put('/mancala/join/' + "Notarealgame")
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(406);
                });
        })
    })

    describe("Adding a Second Player", function () {
        it('should return the Game Schema results', function () {
            return chai
                .request(app)
                .put('/mancala/join/' + gameInviteCode)
                .then(function (res) {
                    // expect
                    expect(res).to.have.status(200);

                });
        })
    })
})

describe("Mancala Game after Ending", function () {
    let finishedGameInvite;
    let finishedGameID;
    let playerOneFinishedGameToken;
    let playerTwoFinishedGameToken;

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .post('/mancala/')
            .then(function (res) {
                gameObject = JSON.parse(res.text);
                playerOneFinishedGameToken = gameObject.players[0].playerToken;
                finishedGameInvite = gameObject.gameInviteCode;
                finishedGameID = gameObject._id;
            })

    });

    before(function () {

        let gameObject
        
        return chai
            .request(app)
            .put('/mancala/join/' + finishedGameInvite)
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                playerTwoFinishedGameToken = gameObject.players[1].playerToken;
            })

    });

    before(function() {
        return Game
   
            .findByIdAndUpdate(finishedGameID,
                {
                    $set: {
                        "gameState.gameBoard": [0, 0, 0, 0, 0, 2, 5, 4, 3, 2, 5, 1, 0, 15],
                    }
                }, {new: true}
            )
    })

    after(function () {
        return closeServer();
    });

        describe("Mancala Game when last turn is taken", function () {

            it('should prepare the final turn', function () {
                return chai
                .request(app)
                .put('/mancala/' + playerOneFinishedGameToken)
                .send({
                    "pocket": 6
                })
                .then(function (res) {
                    console.log(res.body)
                    // expect
                    expect(res).to.have.status(200);
                    expect(res).to.be.json;
                    expect(res).to.be.an("object")
                })
            });
    })
})

describe("Mancala Game", function () {

    let gameInviteCode;
    let playerOneToken; 
    let playerTwoToken

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .post('/mancala')
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                gameInviteCode = gameObject.gameInviteCode
                playerOneToken = gameObject.players[0].playerToken;
            })

    });

    before(function () {

        let gameObject
        
        runServer(DATABASE_URL);
        return chai
            .request(app)
            .put('/mancala/join/' + gameInviteCode)
            .then(function (res) {
                gameObject = JSON.parse(res.text)
                playerTwoToken = gameObject.players[1].playerToken;
            })

    });

    after(function () {
        return closeServer();
    });

        //Need to remove once a proper user authentication is in place
        describe("Mancala Turn Submitting Errors", function () {
            it('should reject users with a missing pocket', function () {

                return chai
                    .request(app)
                    .put('/mancala/' + playerOneToken)
                    .then(function (res) {
                        // expect
                        expect(res).to.have.status(400);
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