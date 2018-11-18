let URL = "localhost/mancala";

function startGame() {
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
  let playerOneNickname = $(".nickname").val();
  $(".nicknameMenu").addClass("hidden");
  getDataFromMancala(playerOneNickname, renderMancalaGame)
});

$(".pocket").click(function(){
  console.log('I got a click');
});

function getDataFromMancala(nickname, callback) {
  $.post('/', function(data) {
    renderMancalaGame(data)
  })
}

function renderMancalaGame(data) {
  console.log(data)
}

$(function () {
  startGame();
})
