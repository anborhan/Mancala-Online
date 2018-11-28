
let URL = "localhost/mancala";
let playerCode;
let player;
let currentGame;
let lastTurn = 1;
let playerCount = 1;

$('.pocket').click(false);

function playGame() {
  $(".startGame").click(event => {
    event.preventDefault();
    $(".mancalaBoard").addClass("brown");
    $(".mancalaBoard").addClass("blackBoardBorder");
    $(".mancalaBoard").removeClass("whiteBoardBorder");
    $(".opponent").addClass("pocket");
    $(".player").addClass("pocket");
    $(".pocket").addClass("blackBorder");
    $(".pocket").addClass("darkBrown");
    $(".pocket").removeClass("whiteBorder");
    $(".mancala").addClass("blackBorder");
    $(".mancala").addClass("darkBrown");
    $(".mancala").removeClass("whiteBorder");
    $(".nicknameMenu").removeClass("hidden");
    $(".startGame").addClass("hidden");
    $(".joinGame").addClass("hidden");
    $(".backButton").removeClass("hidden");
  });
}

function joinGame() {
  $(".joinGame").click(event => {
    event.preventDefault();
    $(".mancalaBoard").addClass("brown");
    $(".mancalaBoard").addClass("blackBoardBorder");
    $(".mancalaBoard").removeClass("whiteBoardBorder");
    $(".opponent").addClass("pocket");
    $(".player").addClass("pocket");
    $(".pocket").addClass("blackBorder");
    $(".pocket").addClass("darkBrown");
    $(".pocket").removeClass("whiteBorder");
    $(".mancala").addClass("blackBorder");
    $(".mancala").addClass("darkBrown");
    $(".mancala").removeClass("whiteBorder");
    $(".joinGameMenu").removeClass("hidden");
    $(".startGame").addClass("hidden");
    $(".joinGame").addClass("hidden");
    $(".backButton").removeClass("hidden");
  });
}


$(".backButton").click(function () {
  $(".mancalaBoard").removeClass("brown");
  $(".mancalaBoard").removeClass("blackBoardBorder");
  $(".mancalaBoard").addClass("whiteBoardBorder");
  $(".pocket").removeClass("blackBorder");
  $(".pocket").removeClass("darkBrown");
  $(".pocket").addClass("whiteBorder");
  $(".mancala").removeClass("blackBorder");
  $(".mancala").removeClass("darkBrown");
  $(".mancala").addClass("whiteBorder");
  $(".joinGameMenu").addClass("hidden");
  $(".startGame").removeClass("hidden");
  $(".joinGame").removeClass("hidden");
  $(".backButton").addClass("hidden");
  $(".nicknameMenu").addClass("hidden");
  $(".opponent").removeClass("pocket");
  $(".player").removeClass("pocket");
})


$(".nicknameMenu").submit(event => {
  event.preventDefault();
  let playerOneNickname = $(".nicknameChoice").val();
  $(".nicknameMenu").addClass("hidden");
  player = 1;
  getDataFromMancala(playerOneNickname, checkScores)
});

$(".joinGameMenu").submit(event => {
  event.preventDefault();
  let playerTwoNickname = $(".nickname").val();
  console.log(playerTwoNickname)
  let gameCode = $(".gameCode").val();
  player = 2;
  console.log(player)
  $(".joinGameMenu").addClass("hidden");
  joinExistingGame(playerTwoNickname, gameCode, checkScores)
})

window.setInterval(function () {
  if (!currentGame || (currentGame.players && currentGame.players.length === 2 && currentGame.gameState.currentPlayer === player)) return;
  updateCurrentGame(checkTurnNumber);
}, 5000);

function updateCurrentGame(callback) {
  const settings = {
    url: `/mancala/${currentGame.players[player-1].playerToken}`,
    type: 'GET',
    success: function (data) {
      setCurrentGame(data)
      console.log("CurrentGame updated!")
      callback();
    },
  };

  $.ajax(settings);
}

function checkTurnNumber() {

  if (currentGame && currentGame.players && currentGame.players.length !== playerCount) {
    playerCount = 2;
    checkScores(currentGame)
  }
  if (currentGame && currentGame.gameState && currentGame.gameState.turn !== lastTurn) {
    lastTurn = currentGame.gameState.turn;
    checkScores(currentGame)
    console.log(lastTurn)
    console.log(currentGame.gameState.turn)
  } else {
    console.log(currentGame)
    console.log(lastTurn)
  }

}

function getDataFromMancala(nickname, callback) {
  console.log(nickname)
  const settings = {
    url: "/mancala",
    data: {
      "nickname": nickname,
    },
    type: 'POST',
    success: function (data) {
      setCurrentGame(data)
      callback(data);
    },
  };

  $.ajax(settings);
}

function setCurrentGame(data) {
  currentGame = data;
  if (localStorage && localStorage.setItem) {
    localStorage.setItem("mancalaGameInProgress", currentGame);
  }
}

function joinExistingGame(nickname, gameCode, callback) {
  console.log(nickname)
  console.log(gameCode)
  const settings = {
    url: `/mancala/join/${gameCode}`,
    data: {
      "nickname": nickname,
    },
    type: 'GET',
    success: function (data) {
      setCurrentGame(data);
      callback(data);
    },
  };

  $.ajax(settings);
}

function loadCurrentGame() {
  if (localStorage && localStorage.getItem) {
    const gameInProgress = localStorage.getItem("mancalaGameInProgress")
    if (gameInProgress && !gameInProgress.gameOver) {
      currentGame = gameInProgress;
      checkScores(currentGame)
    }
  }

}

function provideInviteUrl(data) {
  console.log(data)
  $(".inviteCode").removeClass("hidden");
  if (data && data.gameInviteCode) {
    $(".inviteCode").html(`<strong>YOUR INVITE CODE IS: </strong> ${data.gameInviteCode}`);
  } else {
    $(".invideCode").html("");
  }
  //Copy to Clipboard
}

function checkScores(data) {
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
    $(".inviteCode").addClass("hidden");
  }

  if (data.gameState.gameOver === true) return renderEndGame(data);
  console.log(player)
  renderMancalaGame(data)
}

function renderEndGame(data) {
  //make final score appear with scores and announce winner
  $(".endGame").removeClass("hidden");
  if (player === 1) {
    $(".endGame").append(`<div>Your Score: ${currentGame.scores[0]}</div>`)
    $(".endGame").append(`<div>${currentGame.players[1].nickname}'s Score: ${currentGame.scores[1]}</div>`)
  } else {
    $(".endGame").append(`<div>Your Score: ${currentGame.scores[1]}</div>`)
    $(".endGame").append(`<div>${currentGame.players[0].nickname}'s Score: ${currentGame.scores[0]}</div>`)
  }
  $(".endGame").append(`<div>${currentGame.winner} is the winner!`)
}

function renderMancalaGame(data) {
  provideInviteUrl(data);
  console.log("Running!")
  $(".scoreBoard").removeClass("hidden");
  if (player === 1) {
    renderPlayerOne(data)
  } else {
    renderPlayerTwo(data)
  }

  // minimizePieceOverlap();
  /* pockets.forEach(pocket => {
     console.log(pocket)
   })*/
}

function renderPlayerOne(data) {
  for (let i = 0; i < 14; i++) {
    let score;
    if (i < 6) {
      score = $(`<div class = "pocketScorePlayer" id="Pocket${i + 1}">${data.gameState.gameBoard[i]}</div>`)
    } else {
      score = $(`<div class = "pocketScoreOpponent" id="Pocket${i + 1}">${data.gameState.gameBoard[i]}</div>`)
    }
    $(`[data-pocket-order=${i + 1}]`).html(score)
    for (let j = data.gameState.gameBoard[i]; j > 0; j--) {
      let coordinates = generateRandomPocketCoordinates();
      const piece = $('<div class="piece"></div>');
      piece.css({ "left": coordinates[0], "top": coordinates[1] }) //Right place for top and left?
      $(`[data-pocket-order=${i + 1}]`).append(piece)
    }
    if (i <= 5) {
      $(`[data-pocket-order=${i + 1}]`).attr("tabIndex", i + 1)
    } else $(`[data-pocket-order=${i + 2}]`).attr("tabIndex", i + 1)
  }
  displayTurn();
}

function renderPlayerTwo(data) {
  let k = 7
  for (let i = 0; i < 14; i++) {
    let score
    if (k >= 6) {
      score = $(`<div class = "pocketScoreOpponent" id="Pocket${i + 1}">${data.gameState.gameBoard[i]}</div>`)
    } else {
      score = $(`<div class = "pocketScorePlayer" id="Pocket${k + 1}">${data.gameState.gameBoard[i]}</div>`)
    }
    $(`[data-pocket-order=${k + 1}]`).html(score)
    $(`[data-pocket-order=${k + 1}]`).attr("pocketPlayerTwo", i + 1)
    for (let j = data.gameState.gameBoard[i]; j > 0; j--) {
      let coordinates = generateRandomPocketCoordinates();
      const piece = $('<div class="piece"></div>');
      piece.css({ "left": coordinates[0], "top": coordinates[1] }) //Right place for top and left?
      $(`[data-pocket-order=${k + 1}]`).append(piece)
    }
    if (i <= 5) {
      $(`[data-pocket-order=${i + 1}]`).attr("tabIndex", i + 1)
    } else $(`[data-pocket-order=${i + 2}]`).attr("tabIndex", i + 1)
    if (k < 13) {
      k++;
    } else {
      k = 0;
    }
  }
  displayTurn();
}

function displayTurn() {
  console.log(currentGame)
  if (currentGame && currentGame.players && currentGame.players.length > 1) $(".turnAlert").removeClass("hidden");
  if ((currentGame.gameState.currentPlayer === 1 && player === 1) || (currentGame.gameState.currentPlayer === 2 && player === 2)) {
    $(".turnAlert").html("It's your turn!")
  } else if (currentGame.gameState.currentPlayer === 1 && player === 2) {
    $(".turnAlert").html(`It's ${currentGame.players[0].nickname}'s turn!`)
  } else $(".turnAlert").html(`It's ${currentGame.players[1].nickname}'s turn!`)
}

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

function getDistances(distances) {
}

function rearrangePiece() {

}

function cssPercentagesFromPiece(piece) {
  let top = $(piece).css("top");
  top = parseInt(top);
  let left = $(piece).css("left");
  left = parseInt(left);
  return { top, left }
}

function generateRandomPocketCoordinates() {
  let coordinates = generateRandomNumberWithinCircle(0.8);
  coordinates[0] = translateNumberFromFloatToPercentage(coordinates[0]);
  coordinates[1] = translateNumberFromFloatToPercentage(coordinates[1]);
  return coordinates
}

function generateRandomNumberWithinCircle(diameter) {
  let coordinates = generateRandomCoordinatesFromNumbers(diameter);
  while (!areCoordinatesInCircle(coordinates, diameter)) {
    coordinates = generateRandomCoordinatesFromNumbers(diameter)
  }
  return coordinates;
}

function generateRandomCoordinatesFromNumbers(diameter) {
  return [generateRandomNumber(diameter), generateRandomNumber(diameter)];
}

function generateRandomNumber(diameter) {
  return Math.random() * diameter;
}

function areCoordinatesInCircle(coordinates, diameter) {
  const radius = diameter / 2;
  const distance = Math.sqrt(Math.pow((coordinates[0] - 0.5), 2) + Math.pow((coordinates[1] - 0.5), 2))
  if (distance < radius) {
    return true;
  } else return false;
}

function translateNumberFromFloatToPercentage(number) {
  return number * 100;
}

//need to translate coordinates of distance from center to distance from top left
//any function that gives point inside circle expressed as top/left percentage scale

$(".player, .opponent").click(function () {
  if (!currentGame) {
    return false;
  }
  // let pocketValue = $(this).text();
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
      setCurrentGame(data)
      checkScores(data);
    },
  };

  $.ajax(settings);
});

function resetNickname() {
  $(".nicknameMenu")[0].reset();
}

$(function () {
  playGame();
  joinGame();
  resetNickname();
  loadCurrentGame();
})
