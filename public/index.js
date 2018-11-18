
let URL = "localhost/mancala";

let EXAMPLE_GAME = {
  "players": [
    {
      "nickname": "PlayerOne",
      "playerToken": "testToken"
    },
    {
      "nickname": "PlayerTwo",
      "playerToken": "testToken"
    }
  ],
  "gameInviteCode": "bluetoothB2Bprotocol",
  "gameInviteUrl": "localhost:8080/join/bluetoothB2Bprotocol",
  "startTime": "2018-11-18T02:50:19.759Z",
  "gameState": {
    "gameBoard": [
      4,
      4,
      4,
      4,
      4,
      4,
      0,
      4,
      4,
      4,
      4,
      4,
      4,
      0
    ],
    "startingPlayer": 1,
    "currentPlayer": 1,
    "turn": 1,
    "gameOver": false
  },
  "_id": "5bf0d36be5b85418106da923"
}

function playGame() {
  $(".startGame").click(event => {
    event.preventDefault();
    $(".mancalaBoard").addClass("brown");
    $(".mancalaBoard").addClass("blackBoardBorder");
    $(".mancalaBoard").removeClass("whiteBoardBorder");
    $(".pocket").addClass("blackBorder");
    $(".pocket").addClass("darkBrown");
    $(".pocket").removeClass("whiteBorder");
    $(".mancala").addClass("blackBorder");
    $(".mancala").addClass("darkBrown");
    $(".mancala").removeClass("whiteBorder");
    $(".nicknameMenu").removeClass("hidden");
    $(".startGame").addClass("hidden");
  });
}

$(".nicknameMenu").submit(event => {
  event.preventDefault();
  let playerOneNickname = $(".nicknameChoice").val();
  $(".nicknameMenu").addClass("hidden");
  getDataFromMancala(playerOneNickname, renderMancalaGame)
  //temporaryMancala(playerOneNickname)
 // provideInviteUrl(EXAMPLE_GAME)
});

function temporaryMancala(nickname) {
  EXAMPLE_GAME.players[0].nickname = nickname || "PlayerOne";
  provideInviteUrl(EXAMPLE_GAME)
}

function getDataFromMancala(nickname, callback) {
  const settings = {
    url: "/mancala",
    data: {
      "nickname": nickname,
    },
    type: 'POST',
    success: function (data) {
      proviteInviteUrl(data);
    },
  };

  $.ajax(settings);
}

function provideInviteUrl(data) {
  $(".inviteCode").removeClass("hidden");
  $(".inviteCode").html(`<strong>YOUR INVITE CODE IS: </strong> ${data.gameInviteUrl}`);
  checkScores(data)
  //Copy to Clipboard
}

function checkScores(data) {
  if (data.gameState.gameOver === true) return renderEndGame(data);
  $('.scorePlayer').html(`${data.players[0].nickname}'s Score: ${data.gameState.gameBoard[6]}`)
  $('.scoreOpponent').html(`${data.players[1].nickname}'s Score: ${data.gameState.gameBoard[13]}`)
  renderMancalaGame(data)
}

function renderEndGame(data) {
  //make final score appear with scores and announce winner
}

function renderMancalaGame(data) {
  $(".scoreBoard").removeClass("hidden");
  for (i = 0; i < 14; i++) {
    $(`#Pocket${i + 1}`).html(data.gameState.gameBoard[i])
    for (j = data.gameState.gameBoard[i]; j>0; j--) {
      $(`#Pocket${i + 1}`).append('<div class="piece"></div>')
    }
    if (i <=5) {
      $(`#Pocket${i + 1}`).attr("tabIndex", i + 1)
    } else $(`#Pocket${i + 2}`).attr("tabIndex", i + 1)
  }

  /* pockets.forEach(pocket => {
     console.log(pocket)
   })*/
}

$(".pocket").click(function () {
  // let pocketValue = $(this).text();
  let pocket = $(this).attr("tabIndex")
  console.log(pocket)
  console.log("Pocket was clicked!")
  const settings = {
    url: `/mancala/${playerCode}`,
    data: {
      "pocket": pocket,
    },
    type: 'PUT',
    success: function (data) {
      checkForEndGame(data);
    },
  };

  $.ajax(settings);
});

function resetNickname() {
  $(".nicknameMenu")[0].reset();
}

$(function () {
  playGame();
  resetNickname()
})
