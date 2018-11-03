const POCKETS_PER_PLAYER = 6;
const MANCALAS_PER_PLAYER = 1;
const STARTING_STONES_PER_POCKET = 4;

function newGamePockets() {
  const pockets = [];
  
  for (let i = 0; i <= 1; i++) {
      for (let j = 0; j < POCKETS_PER_PLAYER; j++) {
          pockets.push(STARTING_STONES_PER_POCKET);
      }
      pockets.push(0);
  }

  // with player 1, 3  pockets[2] = 13;
  return pockets;
}

function startGame () {
  let gameBoard = newGamePockets();
  const startingPlayer = 1;
  const turn = 1;
  console.log("Initial Board: " + gameBoard);
  return {gameBoard, startingPlayer, currentPlayer: startingPlayer, turn, gameOver: false};
};

function takeTurn(myPlayerNumber, myPocketNumber, gameState) {
  const output = Object.assign({}, gameState);
  const pocketInfo = pocketInformation(myPlayerNumber, myPocketNumber)

  // error checking
  const {myPocketMinimum, myMancala, currentPocketIndex} = pocketInfo;
  if (!gameState) {
    output.error = "No game found, please use Start Game to begin a game"
  } else if (output.gameOver) {
    output.error = "The game is over!"
  }else if (myPlayerNumber !== gameState.currentPlayer) {
    output.error = "It's not your turn!"
  } else if (currentPocketIndex == myMancala) {
    output.error = "You can't pick your mancala!"
  } else if (currentPocketIndex >= myMancala || currentPocketIndex < myPocketMinimum) {
    output.error = "You can't pick an opponent's pocket!"
  } else if (output.gameBoard[currentPocketIndex] === 0) {
    output.error = "You can't select a pocket with no stones in it!"
  }

  // success
  if (!output.error) {
    //distribute will modify pocketInfo and output.gameBoard
    distribute(pocketInfo, output.gameBoard)
    if (checkForRepeatTurn(pocketInfo, output.gameBoard)) {
      //repeat turn (do not change current player)
    } else {
      output.currentPlayer = getOtherPlayerNumber(output.currentPlayer);
      if (checkFinalPocket(pocketInfo, output.gameBoard)) {
      output.gameBoard = scoreFinalPocket(pocketInfo, output.gameBoard);
      }
    }
    output.scores = [output.gameBoard[POCKETS_PER_PLAYER], output.gameBoard[POCKETS_PER_PLAYER*2 + MANCALAS_PER_PLAYER]];

    if (isGameOver(output.gameBoard)/*There are no more playable pockets*/) {
      output.gameOver = true;
      if (output.scores[0] === output.scores[1]) {
        output.tie = true;
      } else output.winner = output.scores[0] > output.scores[1] ? 1 : 2;
    } else { 
      output.turn += 1;
    }
  }

  return output;
}

function isGameOver(gameBoard) {
  console.log("Checking")
  let playerOneGameBoard = gameBoard.slice(0, 5)
  let playerTwoGameBoard = gameBoard.slice(7, 12)
//need to add that other pockets go to score
  const test = playerOneGameBoard.every(isZero)
  if (test) {
    console.log("Testing")
    let extraScore = playerTwoGameBoard.reduce((a,b)=>a+b)
    gameBoard[13] +=extraScore;
    return true;
  } else {
    const test2 = playerTwoGameBoard.every(isZero)
    if (test2) {
      let extraScore = playerOneGameBoard.reduce((a,b)=>a+b)
      gameBoard[7] +=extraScore;
      return true;
    } else return false;
  } 
}

function isZero(currentValue) {
  return currentValue === 0;
}

function pocketInformation(myPlayerNumber, myPocketNumber) {

  const myMancala = getScorePocketIndex(myPlayerNumber);
  const opponentScorePocket = getScorePocketIndex(getOtherPlayerNumber(myPlayerNumber))
  const myPocketMinimum = checkPocketMinimum(myMancala, opponentScorePocket);
  const currentPocketIndex = setPocketIndex(myPocketNumber)

  return {
    myMancala,
    opponentScorePocket,
    myPocketMinimum,
    myPocketNumber,
    currentPocketIndex
  }
}

function getScorePocketIndex(playerNumber) {
  const scorePocket = POCKETS_PER_PLAYER*playerNumber + playerNumber - MANCALAS_PER_PLAYER;
  return scorePocket;
}

function setPocketIndex (myPocketNumber) {
  return currentPocketIndex = myPocketNumber - 1;
};

function distribute (pocketInfo, gameBoard) {
  console.log(gameBoard)
  const {opponentScorePocket} = pocketInfo;

  let hand = collect(pocketInfo.currentPocketIndex, gameBoard);

  while (hand > 0) {
    pocketInfo.currentPocketIndex = advanceNextPocket(pocketInfo, gameBoard);
    gameBoard[pocketInfo.currentPocketIndex] = gameBoard[pocketInfo.currentPocketIndex] + 1;
    hand--;
  }
  return pocketInfo.currentPocketIndex;
};

function advanceNextPocket(pocketInfo, gameBoard){
    let offset = 1;
    // skip other player's mancala
    if ( pocketInfo.currentPocketIndex + 1 === pocketInfo.opponentScorePocket){
        offset = 2
    }
    return pocketInfo.currentPocketIndex = (gameBoard.length + pocketInfo.currentPocketIndex + offset) % gameBoard.length;
}

function collect (startingPocket, gameBoard) {
  const hand = gameBoard[startingPocket];
  gameBoard[startingPocket] = 0;
  return hand;
}

function checkForRepeatTurn(pocketInfo) {
  if (pocketInfo.currentPocketIndex === pocketInfo.myMancala) {
    return true;
  }
  return false;
}

function checkFinalPocket(pocketInfo, gameBoard) {
  //possible issue with when the stone lands in space 0
  const {myPocketMinimum, myMancala, currentPocketIndex} = pocketInfo;
  //console.log(myPocketMinimum, myMancala, currentPocketIndex, gameBoard[currentPocketIndex])
    if (currentPocketIndex < myMancala && currentPocketIndex >= myPocketMinimum) {
      if (gameBoard[currentPocketIndex] === 1) {
        return true;
      }
    }
  return false;
}

function checkPocketMinimum(myMancala, opponentScorePocket) {
  return myPocketMinimum = myMancala - POCKETS_PER_PLAYER;
}

function scoreFinalPocket(pocketInfo, gameBoard) {
  const {myMancala, currentPocketIndex} = pocketInfo;
  let oppositePocket = getOppositePocket(currentPocketIndex);
  gameBoard[myMancala] += gameBoard[currentPocketIndex];
  gameBoard[myMancala] += gameBoard[oppositePocket];
  gameBoard[currentPocketIndex] = 0;
  gameBoard[oppositePocket] = 0;

  return gameBoard;
}

function getOppositePocket(currentPocketIndex) {
  return oppositePocket = (POCKETS_PER_PLAYER*2) - currentPocketIndex;
}

function getOtherPlayerNumber(myPlayerNumber){
  // convert player number to boolean
  let bool = Boolean(myPlayerNumber-1)

  // negate player number
  bool = !bool;
  
  // convert back to number
  let num = Number(bool) + 1;

  return num;
}

module.exports = {startGame, takeTurn, newGamePockets};