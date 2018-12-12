// TABLE OF CONTENTS //
// GLOBALS
// SECTION ONE - STARTING A NEW GAME
// SECTION TWO - JOINING AN EXISTING GAME
// SECTION THREE - PERIODICALLY UPDATING A GAME
// SECTION FOUR - RENDERING A MANCALA GAME
// SECTION FIVE - CALCULATING COORDINATES
// SECTION SIX - ANNOUNCING GAME STATE CHANGES
// SECTION SEVEN - REJOINING A GAME YOU ARE ALREADY IN
// SECTION EIGHT - SCREEN RESETS AND CLASS ADDITION/REMOVAL
// SECTION NINE - CLICKABLE BUTTONS AND INPUTS
// FUNCTIONS THAT RUN ON DOCUMENT READY
// CURRENTLY UNUSED CODE / STRETCH GOALS INCLUDING MINIMIZING PIECE OVERLAP DURING CREATION OF COORDINATES


// GLOBALS
let URL = "localhost/mancala";

let playerCode;
let player;
let currentGame;
let lastTurn;
let renderedGame = false;

// Used specifically for a11y feedback checks in DescribeGameChecks()
let isSecondPlayer = false;
let isInviteCode = false;
let isGameOver = false;
let winnerNickname;
//////////////////////////////

// SECTION ONE - STARTING A NEW GAME

// Reveals the board and nickname menu
function playGame() {
  $(".startGame").click(event => {
    event.preventDefault();
    displayGameBoard();
    $(".nicknameMenu, .backButton").removeClass("hidden");
    $(".startGame, .joinGame").addClass("hidden");
  });
}

// Accepts nickname and runs function to start post request
$(".nicknameMenu").submit(event => {
  event.preventDefault();
  let playerOneNickname = $(".nicknameChoice").val();
  $(".nicknameMenu, .backButton").addClass("hidden");
  player = 1;
  getDataFromMancala(playerOneNickname)
});

// Runs post request to create new game
function getDataFromMancala(nickname) {
  const settings = {
    url: "/mancala",
    data: {
      "nickname": nickname,
    },
    type: 'POST',
    success: function (data) {
      $(".quitButton").removeClass("hidden");
      gameSuccess(data);
    },
    error: function (data) {
      gameFailure(data)
      resetScreen();
    }

  };

  $.ajax(settings);
}
/////////////////////////////////////

// SECTION TWO - JOINING AN EXISTING GAME

// Reveals the board and join game menu
function joinGame() {
  $(".joinGame").click(event => {
    event.preventDefault();
    displayGameBoard();
    $(".joinGameMenu, .backButton").removeClass("hidden");
    $(".startGame., joinGame").addClass("hidden");
  });
}

// Accepts nickname and provided game code/invite code, and runs function to start get request
$(".joinGameMenu").submit(event => {
  event.preventDefault();
  let playerTwoNickname = $(".nickname").val();
  let gameCode = $(".gameCode").val().replace(/\W/g, '');
  player = 2;
  $(".joinGameMenu, .backButton").addClass("hidden");
  joinExistingGame(playerTwoNickname, gameCode)
})

// Runs get request to provide game board information and add player two to the game
function joinExistingGame(nickname, gameCode) {
  const settings = {
    url: `/mancala/join/${gameCode}`,
    data: {
      "nickname": nickname,
    },
    type: 'GET',
    success: function (data) {
      gameSuccess(data)
      displayGameBoard(data);
    },
    error: function (data) {
      gameFailure(data)
      resetScreen();
    }
  };

  $.ajax(settings);
}
/////////////////////////////////////

// SECTION THREE - PERIODICALLY UPDATING A GAME

// Runs the retrieveUpdatedGame function every 5 seconds if a game exists with player(s)
window.setInterval(function () {
  if (!currentGame || !Array.isArray(currentGame.players)) return;
  retrieveUpdatedGame();
}, 5000);

// Runs a get request to provide the most up-to-date information about the game, including whether a new player has joined
function retrieveUpdatedGame() {
  const settings = {
    url: `/mancala/${currentGame.players[player - 1].playerToken}`,
    type: 'GET',
    success: function (data) {
      if (player && player === 1 && data.players.length > 1) {
        $(".inviteCode").removeClass("moveDown");
        if (!data.gameState.gameOver) {
          $(".turnAlert").removeClass("hidden");
        }
      }
      gameSuccess(data);
    },
    error: function(data) {
      gameFailure(data)
    }
  };

  $.ajax(settings);
}
/////////////////////////////////////

// SECTION FOUR - RENDERING A MANCALA GAME

// Retrieves pocket information from player click and updates the gameState based on their choice
$(".player, .opponent").click(function () {
  if (!currentGame) {
    return false;
  }
  let pocket;
  if (player === 1) {
    playerCode = currentGame.players[0].playerToken
    pocket = $(this).attr("data-pocket-order")
  } else {
    playerCode = currentGame.players[1].playerToken;
    pocket = $(this).attr("pocketPlayerTwo")
  }

  const settings = {
    url: `/mancala/${playerCode}`,
    contentTypes: 'application/json',
    data: {
      "pocket": pocket,
    },
    type: 'PUT',
    success: function (data) {
      gameSuccess(data);
    },
    error: function (data) {
      gameFailure(data)
    }
  };

  $.ajax(settings);
});

// Runs after successful requests, updating the local game and retrieving scores/moving on to rendering
function gameSuccess(data) {
  setCurrentGame(data);
  renderScores(data);
}

// Runs after a failed request, providing the error
function gameFailure(data) {
  let err = data
      if (data.responseJSON && data.responseJSON.error) {
        err = data.responseJSON.error
      }
      $(".errorMessage").html(err);
      $('.errorMessage').fadeIn('slow', function () {
        $('.errorMessage').delay(1000).fadeOut('slow');
      })
}

// Updates the local game as well as running the accessibility check
function setCurrentGame(data) {
  checkForGameChangesForAccessibility(data, currentGame)
  currentGame = data;
  if (localStorage && localStorage.setItem) {
    if (currentGame.players && currentGame.players.length) {
      setCurrentGameToken(currentGame)
    }
  }
}

// saves the player token for the current game to local storage
function setCurrentGameToken(currentGame) {
  if (!player) {
    player = (currentGame.players.findIndex(player => playerCode === player.playerToken) + 1)
  }
  localStorage.setItem("mancalaGameMyPlayerToken", currentGame.players[player - 1].playerToken)
}

// Retrieves the current scores and displays them on the page
function renderScores(data) {
  if (data && data.gameState && (!lastTurn || lastTurn === 1 && data.gameState.turn === 1 && data.players.length > 1 || data.gameState.turn !== lastTurn)) {
    lastTurn = data.gameState.turn;
    if (!data || !data.players || !data.players.length) return;
    $('.scorePlayer').html(`${data.players[0].nickname}'s Score: ${data.gameState.gameBoard[6]}`)
    if (data && data.players && data.players.length > 1) {
      if (player === 1) {
        $('.scorePlayer').html(`${data.players[0].nickname}'s Score: ${data.gameState.gameBoard[6]}`)
        $('.scoreOpponent').html(`${data.players[1].nickname}'s Score: ${data.gameState.gameBoard[13]}`)
      } else {
        $('.scoreOpponent').html(`${data.players[0].nickname}'s Score: ${data.gameState.gameBoard[6]}`)
        $('.scorePlayer').html(`${data.players[1].nickname}'s Score: ${data.gameState.gameBoard[13]}`)
      }
    }
    provideInviteAndRejoinUrl(data);
  }
}

// Retrieves generated Invite Code and Rejoin Url and displays them on the page
function provideInviteAndRejoinUrl(data) {
  if (player) {
    let $inviteCode = $(".inviteCode")
    if (player === 1) {
      $inviteCode.removeClass("hidden");
      if (data && data.gameInviteCode) {
        isInviteCode === true;
        $inviteCode.html(`<strong>YOUR INVITE CODE IS: </strong><label class="screenReaderOnly">Your Invite Code:</label><input id="invite" value="${data.gameInviteCode}" readonly>`);
        $inviteCode.append(`<br><strong>YOUR REJOIN LINK IS: </strong><label class="screenReaderOnly">Your Rejoin Link:</label><input id="rejoin" value="${data.players[player - 1].gameRejoinUrl}" readonly>`);
        copyOnClick("rejoin", "invite")
      } else {
        $inviteCode.html(`<br><strong>YOUR REJOIN LINK IS: </strong><legend class="hidden">Your Rejoin Link:</legend><input id="rejoin" value="${data.players[player - 1].gameRejoinUrl}" readonly>`);
        copyOnClick("rejoin")
      }
      //Copy to Clipboard
    } else if (data && data.players[1].gameRejoinUrl) {
      $inviteCode.removeClass("moveDown");
      $inviteCode.html(`<br><strong>YOUR REJOIN LINK IS: </strong><legend class="hidden">Your Rejoin Link:</legend><input id="rejoin" value="${data.players[player - 1].gameRejoinUrl}" readonly>`);
      copyOnClick("rejoin")
    }
  }
  checkForRenderingMancalaPieces(data)
}

// Determines whether to render pieces or not
function checkForRenderingMancalaPieces(data) {
  $(".scoreBoard").removeClass("hidden");
  if ((data && data.players && data.players.length === 1) || data.gameState.turn > 1 || renderedGame === false) {
    if (player === 1) {
      renderPiecesPlayerOne(data)
    } else {
      renderPiecesPlayerTwo(data)
    }
  }
}

// Renders pieces for player one, including random coordinates for each (see Section 5)
function renderPiecesPlayerOne(data) {
  for (let i = 0; i < 14; i++) {
    let score;
    if (i < 6) {
      if (data.gameState.gameBoard[i] === 1) {
        score = $(`<div class = "pocketScorePlayer" id="Pocket${i + 1}"><span class="screenReaderOnly">Pocket ${i + 1} contains</span>${data.gameState.gameBoard[i]}<span class="screenReaderOnly">piece</span></div>`)
      } else score = $(`<div class = "pocketScorePlayer" id="Pocket${i + 1}"><span class="screenReaderOnly">Pocket ${i + 1} contains</span>${data.gameState.gameBoard[i]}<span class="screenReaderOnly">pieces</span></div>`)
    } else if (data.gameState.gameBoard[i] === 1) {
      score = $(`<div class = "pocketScoreOpponent" id="Pocket${i + 1}"><span class="screenReaderOnly">Pocket ${i + 1} contains</span>${data.gameState.gameBoard[i]}<span class="screenReaderOnly">piece</span></div>`)
    } else score = $(`<div class = "pocketScoreOpponent" id="Pocket${i + 1}"><span class="screenReaderOnly">Pocket ${i + 1} contains</span>${data.gameState.gameBoard[i]}<span class="screenReaderOnly">pieces</span></div>`)
    $(`[data-pocket-order=${i + 1}]`).html(score)
    for (let j = data.gameState.gameBoard[i]; j > 0; j--) {
      let coordinates = generateRandomPocketCoordinates();
      const piece = $('<div class="piece"></div>');
      piece.css({ "left": `${coordinates[0]}%`, "top": `${coordinates[1]}%` }) //Right place for top and left?
      $(`[data-pocket-order=${i + 1}]`).append(piece);
    }
    if (i <= 5) {
      $(`[data-pocket-order=${i + 1}]`).attr("tabIndex", i + 1)
    } else if (i > 5 && i < 12) {
      $(`[data-pocket-order=${i + 2}]`).attr("tabIndex", i + 1)
    }
  }
  renderedGame = true;
  displayTurn(data);
}

// Renders pieces for player two, including random coordinates for each (see Section 5)
function renderPiecesPlayerTwo(data) {
  // playerTwoOffset - starts "Pocket 1" on the 7th spot on the array, to account for Player Two's perspective of the board
  let playerTwoOffset = 7
  for (let i = 0; i < 14; i++) {
    let score
    if (playerTwoOffset >= 6) {
      score = $(`<div class = "pocketScoreOpponent" id="Pocket${i + 1}">${data.gameState.gameBoard[i]}</div>`)
    } else {
      score = $(`<div class = "pocketScorePlayer" id="Pocket${playerTwoOffset + 1}">${data.gameState.gameBoard[i]}</div>`)
    }
    $(`[data-pocket-order=${playerTwoOffset + 1}]`).html(score)
    $(`[data-pocket-order=${playerTwoOffset + 1}]`).attr("pocketPlayerTwo", i + 1)
    for (let j = data.gameState.gameBoard[i]; j > 0; j--) {
      let coordinates = generateRandomPocketCoordinates();
      const piece = $('<div class="piece"></div>');
      piece.css({ "left": `${coordinates[0]}%`, "top": `${coordinates[1]}%` }) //Right place for top and left?
      $(`[data-pocket-order=${playerTwoOffset + 1}]`).append(piece)
    }
    if (i <= 5) {
      $(`[data-pocket-order=${i + 1}]`).attr("tabIndex", i + 1)
    } else $(`[data-pocket-order=${i + 2}]`).attr("tabIndex", i + 1)
    if (playerTwoOffset < 13) {
      playerTwoOffset++;
    } else {
      playerTwoOffset = 0;
    }
  }
  renderedGame = true;
  displayTurn(data);
}

// Displays whose turn it is, or renders the end game if the game is over and there are no more turns
function displayTurn(data) {
  if (currentGame.gameState.gameOver === true) {
    return renderEndGame(data);
  }
  if (currentGame && currentGame.players && currentGame.players.length > 1) {
    $(".turnAlert").removeClass("hidden");
    $(".inviteCode").removeClass("moveDown");
  }
  if ((currentGame.gameState.currentPlayer === 1 && player === 1) || (currentGame.gameState.currentPlayer === 2 && player === 2)) {
    $(".turnAlert").html("It's your turn!")
  } else if (currentGame.gameState.currentPlayer === 1 && player === 2) {
    $(".turnAlert").html(`It's ${currentGame.players[0].nickname}'s turn!`)
  } else $(".turnAlert").html(`It's ${currentGame.players[1].nickname}'s turn!`)
}

// Displays the end game screen, with final scores and the winner, as well as the ability to restart
function renderEndGame(currentGame) {
  $(".quitButton, .inviteCode").addClass("hidden");
  $(".endGame, .restartButton").removeClass("hidden");
  $(".turnAlert").addClass("hideVisibility");
  $(".opponent, .player").removeClass("pocket").removeAttr("tabindex");
  let currentPlayer = player - 1;
  $(".endGame").html("FINAL SCORE:")
  $(".endGame").append(`<div>Your Score: ${currentGame.gameState.scores[currentPlayer]}</div>`)
  $(".endGame").append(`<div>${currentGame.players[currentPlayer ? 0 : 1].nickname}'s Score: ${currentGame.gameState.scores[currentPlayer ? 0 : 1]}</div>`)
  let winner = currentGame.gameState.winner - 1;
  if (currentGame.gameState.winner && currentGame.gameState.winner == player) {
    $(".endGame").append(`<div>You won!</div>`)
  } else $(".endGame").append(`<div>${currentGame.players[winner].nickname} is the winner!</div>`)
  //used for a11y purposes
  winnerNickname = `${currentGame.players[winner].nickname}`
}
/////////////////////////////////////

// SECTION FIVE - CALCULATING COORDINATES

// Retrieves coordinates from various functions and returns them to be rendered
function generateRandomPocketCoordinates() {
  let coordinates = generateRandomNumberWithinCircle(1 - getPieceCoordinateOffset() * 2 / 100);
  coordinates[0] = translateNumberFromFloatToPercentage(coordinates[0]);
  coordinates[1] = translateNumberFromFloatToPercentage(coordinates[1]);
  coordinates[0] -= getPieceCoordinateOffset(coordinates[0])
  coordinates[1] -= getPieceCoordinateOffset(coordinates[1])
  return coordinates
}

// Retrieves numbers for coordinates, and continues to do so until the coordinates are in the circle
function generateRandomNumberWithinCircle(diameter) {
  let coordinates = generateRandomCoordinatesFromNumbers(diameter);
  while (!areCoordinatesInCircle(coordinates, diameter)) {
    coordinates = generateRandomCoordinatesFromNumbers(diameter)
  }
  return coordinates;
}

// Creates offset for each coordinate
function getPieceCoordinateOffset() {
  let offset = $(".piece").css("width")
  offset = parseInt(offset) || 0;
  return (offset / 2);
}

// Generates random numbers for each coordinate
function generateRandomCoordinatesFromNumbers(diameter) {
  return [generateRandomNumber(diameter), generateRandomNumber(diameter)];
}

// Generates random number, multiplied times the given diameter
function generateRandomNumber(diameter) {
  return Math.random() * diameter;
}

// Uses the Pythagorean Theorem to determine whether the coordinates are within the circle
function areCoordinatesInCircle(coordinates, diameter) {
  const radius = diameter / 2;
  const distance = Math.sqrt(Math.pow((coordinates[0] - 0.5), 2) + Math.pow((coordinates[1] - 0.5), 2))
  if (distance < radius) {
    return true;
  } else return false;
}

// Translates number to a percentage
function translateNumberFromFloatToPercentage(number) {
  return number * 100;
}
/////////////////////////////////////

// SECTION SIX - ANNOUNCING GAME STATE CHANGES

// Determines whether any changes have been made to the current game state and shares them via aria live
function checkForGameChangesForAccessibility(data, currentGame) {
  if (data && data.gameState && currentGame && currentGame.gameState && data.gameState.turn !== currentGame.gameState.turn) {
    let ariaLiveTurnDescription = describeTurnChange(data, currentGame)
    let ariaLiveGameDescription = describeGameState(data, currentGame)
    if (ariaLiveGameDescription) {
      $(".ariaLiveAnnounceUpdates").html(ariaLiveGameDescription);

    } else if (ariaLiveTurnDescription) {
      $(".ariaLiveAnnounceUpdates").html(ariaLiveTurnDescription);
    }
  }
}

// Generates string based on choices made by each player, such as pocket choice and whose turn it now is
function describeTurnChange(data, currentGame) {
  //creates string based on new info
  let turnAndPocketUpdate
  if (data.gameState && data.gameState.currentPlayer) {
    if (player === currentGame.gameState.currentPlayer) {
      turnAndPocketUpdate = `You chose pocket ${data.gameState.lastPocket} and it is now ${data.players[data.gameState.currentPlayer - 1].nickname}'s turn`
    } else {
      turnAndPocketUpdate = `${data.players[data.gameState.currentPlayer - 1].nickname} chose pocket ${data.gameState.lastPocket} and it is now ${data.players[currentGame.gameState.currentPlayer - 1].nickname}'s turn`
    }
  }
  return turnAndPocketUpdate;
}

// Generates string based on updates to the game state, such as if a code has been created or whether a player has joined the game
function describeGameState(data, currentGame) {
  let gameStateDescription;
  if (isInviteCode === true) {
    //let the player know that their invite code is displayed
    isInviteCode === false;
    gameStateDescription = `Your invite code has been created!`
  } else if (data.players && data.players.length > 1 && isSecondPlayer === false) {
    //player joined game
    isSecondPlayer === true;
    gameStateDescription = `${data.players[1].nickname} has entered the game!`
  } else if (data.gameState.gameOver === true) {
    //game is over
    isGameOver = false;
    gameStateDescription = `The game is over. ${winnerNickname} is the winner!`
  }
  return gameStateDescription;
}
/////////////////////////////////////

// SECTION SEVEN - REJOINING A GAME YOU ARE ALREADY IN

// On page load, retrieves the given URL and determines whether a player token has been provided (if the player is using a rejoin game URL)
// Saves player token to local storage if it exists, and removes the player token from the displayed URL
function assessUrlForRejoin() {
  let myPlayerToken;
  let newUrl;
  if (window.location && window.location.href) {
    let splitUrl = window.location.href.split("#")
    newUrl = `${splitUrl[0]}#`;
    myPlayerToken = splitUrl[1];
    if (splitUrl.length > 1 && localStorage && localStorage.setItem) {
      localStorage.setItem("mancalaGameMyPlayerToken", myPlayerToken)
      window.location.replace(newUrl);
    }
  }
  if (localStorage && localStorage.getItem) {
    myPlayerToken = localStorage.getItem("mancalaGameMyPlayerToken")
  }
  if (myPlayerToken) {
    rejoinGame(myPlayerToken)
  }
}

// Runs a get request to retrieve the game you are requesting, based on the provided player token, whether from the URL or local storage
function rejoinGame(playerToken) {
  const settings = {
    url: `/mancala/${playerToken}`,
    type: 'GET',
    success: function (data) {
      if (data.gameState && !data.gameState.gameOver) {
        playerCode = playerToken;
        gameSuccess(data)
        displayGameBoard(data);
      }
    },
    error: function (data) {
      gameFailure(data)
      resetScreen();
    }
  };

  $.ajax(settings);
}
/////////////////////////////////////

// SECTION EIGHT - SCREEN RESETS AND CLASS ADDITION/REMOVAL

// Resets the screen to the main menu and deletes ongoing game from local storage
function resetScreen() {
  $(".mancalaBoard").removeClass("brown blackBoardBorder").addClass("whiteBoardBorder");
  $(".pocket").removeClass("blackBorder darkBrown").addClass("whiteBorder");
  $(".mancala").removeClass("blackBorder darkBrown").addClass("whiteBorder").empty();
  $(".joinGameMenu").addClass("hidden");
  $(".startGame, .joinGame").removeClass("hidden");
  $(".backButton, .nicknameMenu, .inviteCode, .scoreBoard, .quitButton, .turnAlert").addClass("hidden");
  $(".opponent, .player").removeClass("pocket").removeAttr("tabindex");
  $(".pocketScoreOpponent, .pocketScorePlayer").html("");
  $(".piece").remove();
  $(".scoreOpponent").html("Player Two (Not joined)");
  $(".scorePlayer").html("Player One's Score: 0");
  $(".inviteCode").addClass("moveDown");
  if (localStorage && localStorage.removeItem) {
    localStorage.removeItem("mancalaGameMyPlayerToken");
  }
  playerCode = undefined;
  player = undefined;
  currentGame = undefined;
  lastTurn = undefined;
  isSecondPlayer = false;
  isInviteCode = false;
  isGameOver = false;
  winnerNickname = undefined;
}

// Displays game board from main menu
function displayGameBoard(data) {
  $(".mancalaBoard").addClass("brown blackBoardBorder");
  $(".mancalaBoard").removeClass("whiteBoardBorder");
  $(".opponent, .player").addClass("pocket");
  $(".pocket").addClass("blackBorder darkBrown");
  $(".pocket").removeClass("whiteBorder");
  $(".mancala").addClass("blackBorder darkBrown");
  $(".mancala").removeClass("whiteBorder");
  if (data) {
    $(".startGame, .joinGame").addClass("hidden");
    provideInviteAndRejoinUrl(data)
    $(".quitButton, .inviteCode").removeClass("hidden");
  }
}

// Resets forms
function resetForms() {
  $(".nicknameMenu")[0].reset();
  $(".joinGameMenu")[0].reset();
}
/////////////////////////////////////

// SECTION NINE - CLICKABLE BUTTONS AND INPUTS

// Prevents clicking on pockets unless there are pieces inside
$('.pocket').click(false);

// Copies invite code and rejoin link to clipboard from click
function copyOnClick(rejoinId, inviteId) {
  if (currentGame) {
    document.getElementById(rejoinId).onclick = function () {
      this.select();
      document.execCommand('copy');
      $(".errorMessage").html(`Copied to clipboard`);
      $('.errorMessage').fadeIn('slow', function () {
        $('.errorMessage').delay(1000).fadeOut('slow');
      })
    }
    if (inviteId) {
      document.getElementById(inviteId).onclick = function () {
        this.select();
        document.execCommand('copy');
        $(".errorMessage").html(`Copied to clipboard`);
        $('.errorMessage').fadeIn('slow', function () {
          $('.errorMessage').delay(1000).fadeOut('slow')
        });
      }
    }
  }
}

// Restarts the client/returns to main menu on game completion
$(".restartButton").click(event => {
  event.preventDefault();
  renderedGame = false;
  resetForms();
  resetScreen();
  $(".restartButton, .endGame").addClass("hidden");
})

// Return to the main menu from nickname and join game menus
$(".backButton").click(function () {
  resetForms();
  resetScreen();
})

// Quit a currently running game
$(".quitButton").click(function () {
  $(".quitGame").removeClass("hidden");
  $(".quitButton").addClass("hidden");
  $(".inviteCode").addClass("displayNoneVertical");
})

$(".quitYes").click(function () {
  $(".quitGame").addClass("hidden");
  $(".inviteCode").removeClass("displayNoneVertical");
  renderedGame = false;
  resetForms();
  resetScreen();
})

$(".quitNo").click(function () {
  $(".quitGame").addClass("hidden");
  $(".inviteCode").removeClass("displayNoneVertical");
  $(".quitButton").removeClass("hidden");
})

/////////////////////////////////////

// FUNCTIONS THAT RUN ON DOCUMENT READY
$(function () {
  playGame();
  joinGame();
  resetForms();
  assessUrlForRejoin();
})
/////////////////////////////////////

// CURRENTLY UNUSED CODE / STRETCH GOALS INCLUDING MINIMIZING PIECE OVERLAP DURING CREATION OF COORDINATES
  // minimizePieceOverlap();
  /* pockets.forEach(pocket => {
     console.log(pocket)
   })*/
/*
function minimizePieceOverlap() {

  $(".pocket").each(function (index, pocket) {
    let distances = [];

    //finding each piece within the pocket
    let $pieces = $(pocket).find(".piece")
    $pieces.each(function (index, piece) {

      //found piece
      let css = cssPercentagesFromPiece(piece)
      for (let i = 0; i < $pieces.length; i++) {
        if (i === index) continue
        let otherCss = cssPercentagesFromPiece($pieces[i]);
        let distance = Math.sqrt(Math.pow(Math.abs(css.left - otherCss.left), 2) + Math.pow(Math.abs(css.top - otherCss.top), 2))
        distances.push(distance);
      }
    })

   getDistances(distances)
  })
}

function cssPercentagesFromPiece(piece) {
  let top = $(piece).css("top");
  top = parseInt(top);
  let left = $(piece).css("left");
  left = parseInt(left);
  return { top, left }
}

function getDistances(distances) {
}

function rearrangePiece() {

}

function loadSavedGame() {
  if (currentGame && currentGame.gameState.gameOver === false && myPlayerToken) {
    displayGameBoard(data);
    if (Array.isArray(loadedGame.players)) {
      const loadedGamePlayerNumber = loadedGame.players.findIndex(player => player.playerToken === myPlayerToken)
      if (loadedGamePlayerNumber !== -1) {
        player = loadedGamePlayerNumber + 1;
        currentGame = loadedGame;
        retrieveUpdatedGame();
      }
    }
  }
}*/

//need to translate coordinates of distance from center to distance from top left
//any function that gives point inside circle expressed as top/left percentage scale