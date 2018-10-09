'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer } = require('../server');
const mancala = require('../mancala/mancalaRouter');

const expect = chai.expect;

describe('mancala', function() {

    before(function() {
        return runServer();
      });
    
    after(function() {
        return closeServer();
    });

    describe('mancala', function() {
        describe('POST', function(){
        // test running a turn without starting the game
            it('should return an error', function() {
                return chai
                .request(app)
                .post('mancala')
                .send({
                    myPlayerNumber,
                    myPocketNumber,
                    gameState
                })
                .then(function(res) {
                   // expect(res).to.contain error
                  });
            })
        })
    })

})