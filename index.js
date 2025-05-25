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
let typedWords = 0;
let errors = 0;
let words = [];
let wordsList = [];
let n = wordsList.length;
let startTime = Date.now();
let typeSound = new Audio("src/type.mp3")
let errorSound = new Audio("src/error.mp3")

fetch("words.json")
  .then((resp) => resp.json())
  .then((data) => {
    wordsList = data.words;
    n = wordsList.length;
    animate();
  });

class Word {
  constructor() {
    this.word = wordsList[Math.floor(Math.random() * n)];
    this.typedLetters = "";
    this.x = -(this.word.length * fontSize);
    this.y = Math.floor(Math.random() * (h - 2 * fontSize)) + fontSize;
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
}

function getTime() {
  return Math.floor((Date.now() - startTime) / 1000); // in seconds
}

function isSpawnable() {
  // true if no words or last word > maxDistToSpawn
  return words.length === 0 || words[words.length - 1].x >= maxDistToSpawn;
}

function playTypeSound() {
  typeSound.currentTime = 0;
  typeSound.play();
}

function playErrorSound() {
  errorSound.currentTime = 0;
  errorSound.play();
}

document.addEventListener("keydown", function (event) {
  if(words[0].type(event.key.toLowerCase())) {
    playTypeSound();
  } else {
    playErrorSound();
    errors++;
  }
});

function animate() {
  c.fillStyle = bgCol;
  c.fillRect(0, 0, canvas.width, canvas.height);

  // remove typed words
  prevLength = words.length;
  words = words.filter((word) => !word.isCompleted());
  typedWords += prevLength - words.length;

  // add new words
  if (isSpawnable()) {
    words.push(new Word());
    lastSpawnTime = Date.now();
  }

  // draw words
  for (let word of words) {
    word.update();
    word.draw();
  }

  // draw total words typed
  c.fillStyle = redCol;
  c.fillText(String(typedWords), w - 4 * fontSize, 5 + 2 * fontSize);
  requestAnimationFrame(animate);
}
