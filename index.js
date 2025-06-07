let canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");
let w = (canvas.width = innerWidth);
let h = (canvas.height = innerHeight);

c.font = "36px consolas";
let fontSize = 18;
let wordSpeed = 2;
let maxDistToSpawn = 300;
let wordCol = "#394760";
let bgCol = "#0B0E13";
let typedCol = "#9FADC6";
let redCol = "#FF0000";
let words = [];
let typedWords = 0;
let errors = 0;
let startTime = Date.now();
let endTime = Date.now();
let wordsList = [];
let n = wordsList.length;
let typeSound = new Audio("src/type.mp3");
let errorSound = new Audio("src/error.mp3");
typeSound.volume = 0.4;
errorSound.volume = 0.4;
let gameState = "gameMenu"; // "gameMenu" -> "playing" <-> "gameOver"

// get words list then animate
fetch("words.json")
  .then((resp) => resp.json())
  .then((data) => {
    wordsList = data.words;
    n = wordsList.length;
    animate();
  });

class Word {
  constructor(
    word = wordsList[Math.floor(Math.random() * n)],
    x = -(word.length * fontSize),
    y = Math.floor(Math.random() * (h - 2 * fontSize)) + fontSize
  ) {
    this.word = word;
    this.typedLetters = "";
    this.x = x;
    this.y = y;
  }
  update() {
    this.x += wordSpeed;
  }
  draw() {
    let tempx = this.x;
    c.fillStyle = typedCol;
    for (let letter of this.typedLetters) {
      c.fillText(letter, tempx, this.y);
      tempx += fontSize;
    }
    c.fillStyle = wordCol;
    for (let letter of this.word) {
      c.fillText(letter, tempx, this.y);
      tempx += fontSize;
    }
  }
  type(letter) {
    if (this.word[0] === letter) {
      this.word = this.word.slice(1);
      this.typedLetters += letter;
      return true;
    }
    return false;
  }
  isCompleted() {
    return this.word.length === 0;
  }
  isOutOfScreen() {
    return this.x > w;
  }
}

let startWord = new Word(
  "start",
  w / 2 - 2.5 * fontSize,
  h / 2 - 0.5 * fontSize
);

function isSpawnable() {
  // true if (no words on screen) or (last word position > maxDistToSpawn)
  return words.length === 0 || words[words.length - 1].x >= maxDistToSpawn;
}

function playSound(sound) {
  if (sound === "type") {
    typeSound.currentTime = 0;
    typeSound.play();
    return;
  }
  if (sound === "error") {
    errorSound.currentTime = 0;
    errorSound.play();
    return;
  }
}

function resetVars() {
  words = [];
  typedWords = 0;
  errors = 0;
  wordSpeed = 2;
  startTime = Date.now();
}

function drawGameMenu() {
  startWord.draw();
  if (startWord.isCompleted()) {
    resetVars();
    gameState = "playing";
  }
}

function drawGameOverScreen() {
  drawGameMenu();

  let scores = [
    `Words typed:         ${typedWords}`,
    `Wrong letters typed: ${errors}`,
    `Time lasted:         ${parseInt((endTime - startTime) / 1000)}s`,
  ];

  for (let i = 0; i < scores.length; i++) {
    c.fillText(scores[i], fontSize, 2.5 * fontSize + i * 2 * fontSize);
  }
}

function drawGame() {
  // check game over
  if (words.length > 0 && words[0].isOutOfScreen()) {
    gameState = "gameOver";
    endTime = Date.now();
    startWord.word = "restart";
    startWord.typedLetters = "";
    return;
  }

  // remove typed words
  prevLength = words.length;
  words = words.filter((word) => !word.isCompleted());
  typedWords += prevLength - words.length;

  // add new words
  if (isSpawnable()) {
    words.push(new Word());
    lastSpawnTime = Date.now();
  }

  // increase wordSpeed gradually
  wordSpeed = 2 + ((Date.now() - startTime) * 0.02) / 1000;

  // draw words
  for (let word of words) {
    word.update();
    word.draw();
  }

  // draw total words typed
  c.fillStyle = redCol;
  c.fillText(String(typedWords), w - 4 * fontSize, 5 + 2 * fontSize);
}

document.addEventListener("keydown", function (event) {
  if (gameState === "gameMenu" || gameState === "gameOver") {
    if (startWord.type(event.key.toLowerCase())) {
      playSound("type");
    } else {
      playSound("error");
    }
  } else if (gameState === "playing") {
    if (words[0].type(event.key.toLowerCase())) {
      playSound("type");
    } else {
      playSound("error");
      errors++;
    }
  }
});

function animate() {
  // clear bg
  c.fillStyle = bgCol;
  c.fillRect(0, 0, canvas.width, canvas.height);

  if (gameState === "gameMenu") {
    drawGameMenu();
  } if (gameState === "playing") {
    drawGame();
  } if (gameState === "gameOver") {
    drawGameOverScreen();
  }

  requestAnimationFrame(animate);
}
