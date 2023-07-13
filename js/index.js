let SPEED = 0.25;
class Game {
  constructor(
    gameElement,
    bird,
    obstacle,
    scoreElements,
    highScoreElements,
    gameSummaryElement,
    restartElement,
    instructions
  ) {
    this.gameElement = gameElement;
    this.scoreElements = scoreElements;
    this.highScoreElements = highScoreElements;
    this.gameSummaryElement = gameSummaryElement;
    this.instructions = instructions;
    this.bird = bird;
    this.obstacle = obstacle;
    this.score = 0;
    this.restartElement = restartElement;
    this.setHighscore(highScoreElements);
  }

  setHighscore = (highScoreElements) => {
    if (!localStorage.getItem("Highscore")) {
      localStorage.setItem("Highscore", 0);
    }
    highScoreElements.forEach(
      (element) => (element.innerHTML = localStorage.getItem("Highscore"))
    );
  };

  startGame = () => {
    this.score = 0;
    this.gameSummaryElement.style.display = "none";
    this.instructions.style = "none";
    window.addEventListener("keypress", this.bird.setJump);
    this.frameId = setInterval(this.startFrame, 10);
  };

  startFrame = () => {
    this.obstacle.moveBlock();
    this.updateScore();
    this.bird.dropBird();
    this.bird.checkJump();
    this.detectCollision();
  };

  detectCollision = () => {
    let birdPosition = this.bird.getbirdPosition();
    let obstaclePosition = this.obstacle.getObstaclePosition();
    //for top or bottom collision
    if (birdPosition.topValue <= 0 || birdPosition.topValue >= 95) {
      this.stopGame();
    }

    //for obstacle collision
    if (
      birdPosition.rightValue + obstaclePosition.topBlockLeftValue <= 100 &&
      birdPosition.rightValue + obstaclePosition.topBlockLeftValue >= 90
    ) {
      //collision if obstacle at top is touched or obstacle at bottom is touched
      if (
        birdPosition.topValue <= obstaclePosition.topBlockHeightValue ||
        birdPosition.topValue + 5 + obstaclePosition.bottomBlockHeightValue >
          100
      ) {
        this.stopGame();
      }
    }
  };

  //update score
  updateScore = () => {
    if (this.obstacle.getPassed()) {
      this.score++;
    }
    this.scoreElements.forEach((element) => (element.innerHTML = this.score));
  };

  showGameSummary = () => {
    this.gameSummaryElement.style.display = "flex";
  };

  checkHighScore = () => {
    console.log(this.score);
    if (Number(localStorage.getItem("Highscore")) < this.score)
      localStorage.setItem("Highscore", this.score);
  };

  stopGame = () => {
    clearInterval(this.frameId);
    document.getElementById("instructions").style.display = "none";
    this.checkHighScore();
    this.showGameSummary();
    this.obstacle.setFlying(false);
    this.bird.className = "";
    let audio = new Audio("./sounds/punch.mp3");
    audio.play();
    window.removeEventListener("keypress", this.setJump);
    this.restartElement.onclick = () => window.location.reload();
  };
}

class Bird {
  constructor(birdElement, top, right) {
    this.JUMP_DISTANCE = 0;
    this.birdElement = birdElement;
    birdElement.style.top = top + "%";
    birdElement.style.right = right + "%";
  }

  checkJump = () => {
    if (this.JUMP_DISTANCE > 0) {
      this.moveBirdUp();
      this.JUMP_DISTANCE = this.JUMP_DISTANCE - 1;
    } else {
      this.birdElement.classList.remove("bird-rotate-up");
    }
  };

  getbirdPosition = () => {
    let topValue = Number(this.birdElement.style.top.replace(/%/g, ""));
    let rightValue = Number(this.birdElement.style.right.replace(/%/g, ""));
    return { topValue, rightValue };
  };

  dropBird = () => {
    this.birdElement.style.top = this.getbirdPosition().topValue + 0.5 + "%";
    this.birdElement.classList.add("bird-rotate-down");
  };

  setJump = (event) => {
    let audio = new Audio("./sounds/bird.mp3");
    audio.play();
    let topValue = Number(this.birdElement.style.top.replace(/%/g, ""));

    this.birdElement.className = "bird-rotate-up";
    if (event.code == "KeyW" && topValue < 90 && topValue > 1) {
      if (document.getElementById("instructions"))
        document.getElementById("instructions").style.display = "none";
      this.JUMP_DISTANCE = 15;
    }
  };

  moveBirdUp = () => {
    let topValue = this.birdElement.style.top.replace(/%/g, "");
    this.birdElement.style.top = topValue - 1.5 + "%";
  };
}

class Obstacle {
  constructor(topBlockElement, bottomBlockElement, left) {
    this.speedCounter = 0; //for increasing speed after every 4 obstacles passed
    this.SPEED = 0.45;
    this.passed = false;
    this.topBlockElement = topBlockElement;
    this.bottomBlockElement = bottomBlockElement;
    this.flying = true;
    topBlockElement.style.left = left + "%";
    bottomBlockElement.style.left = left + "%";
    topBlockElement.style.height = "35%";
    bottomBlockElement.style.height = "35%";
  }

  //get obstacle  position
  getObstaclePosition = function () {
    let topBlockLeftValue = Number(
      this.topBlockElement.style.left.replace(/%/g, "")
    );
    let topBlockHeightValue = Number(
      this.topBlockElement.style.height.replace(/%/g, "")
    );
    let bottomBlockLeftValue = Number(
      this.bottomBlockElement.style.left.replace(/%/g, "")
    );
    let bottomBlockHeightValue = Number(
      this.bottomBlockElement.style.height.replace(/%/g, "")
    );
    return {
      topBlockLeftValue,
      bottomBlockLeftValue,
      topBlockHeightValue,
      bottomBlockHeightValue,
    };
  };

  //randomize height of top-block and bottom-block
  obstacleHeightRandomizer = () => {
    let topObstacleHeight = Math.random() * 50;
    let bottomObstacleHeight = Math.random() * 50;
    if (topObstacleHeight + bottomObstacleHeight != 20) {
      bottomObstacleHeight =
        bottomObstacleHeight +
        (70 - (topObstacleHeight + bottomObstacleHeight));
    }
    return { topObstacleHeight, bottomObstacleHeight };
  };

  setFlying(value) {
    this.flying = value;
  }

  getPassed = () => {
    return this.passed;
  };

  moveBlock = function () {
    let obstaclePosition = this.getObstaclePosition();
    // readjust position of obstacle
    if (obstaclePosition.topBlockLeftValue <= 0) {
      console.log("here");
      this.topBlockElement.style.left = "100%";
      this.bottomBlockElement.style.left = "100%";
      let obstacleHeights = this.obstacleHeightRandomizer();
      this.topBlockElement.style.height =
        obstacleHeights.topObstacleHeight + "%";
      this.bottomBlockElement.style.height =
        obstacleHeights.bottomObstacleHeight + "%";
      this.setPassed();
    } else {
      this.passed = false;
      this.topBlockElement.style.left =
        obstaclePosition.topBlockLeftValue - this.SPEED + "%";
      this.bottomBlockElement.style.left =
        obstaclePosition.bottomBlockLeftValue - this.SPEED + "%";
    }
  };

  setPassed = () => {
    this.speedCounter = this.speedCounter + 1;
    this.checkSpeed();
    this.passed = true;
    let audio = new Audio("./sounds/passed.mp3");
    audio.play();
  };

  checkSpeed = () => {
    console.log(this.speedCounter);
    if (this.speedCounter >= 4) {
      this.SPEED += 0.15;
      this.speedCounter = 0;
    }
  };
}

let bird = new Bird(document.getElementById("bird"), 50, 80);
let gameSummaryElement = document.getElementById("game-summary");
let restartElement = document.getElementById("restartBtn");
let instructions = document.getElementById("instructions");
let obstacle = new Obstacle(
  document.getElementById("top-block"),
  document.getElementById("bottom-block"),
  90
);
let game = new Game(
  document.getElementById("game-board"),
  bird,
  obstacle,
  document.querySelectorAll(".scorevalue"),
  document.querySelectorAll(".highscorevalue"),
  gameSummaryElement,
  restartElement,
  instructions
);

game.startGame();
