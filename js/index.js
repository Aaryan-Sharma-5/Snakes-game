var blockSize = 25;
var rows = 26;
var columns = 36;
var board;
var context; 
var snakeX = blockSize * 5;
var snakeY = blockSize * 5;
var velocityX = 0;
var velocityY = 0;
var snakeBody = [];
var foodX;
var foodY;
var gameOver = false;
var score = 0;
var hiscoreval = 0;

const foodSound = new Audio('music/food.mp3');
const moveSound = new Audio('music/move.mp3');
const gameOverSound = new Audio('music/gameover.mp3');

window.onload = function() {
    board = document.getElementById("board");
    board.height = rows * blockSize;
    board.width = columns * blockSize;
    context = board.getContext("2d"); 
    foodCell();
    document.addEventListener("keyup", changeDirection);
    setInterval(update, 100); 

    var hiscore = localStorage.getItem("hiscore");
    if (hiscore !== null) {
        hiscoreval = JSON.parse(hiscore);
    }
    document.getElementById("hiscoreBox").innerHTML = "HiScore: " + hiscoreval;
    document.getElementById("scoreBox").innerHTML = "Score: " + score;
}

function update() {
    if (gameOver) {
        return;
    }
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);

    context.fillStyle = "red";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        foodSound.play();  
        snakeBody.push([foodX, foodY]);
        score++;
        if (score > hiscoreval) {
            hiscoreval = score;
            localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
            document.getElementById("hiscoreBox").innerHTML = "HiScore: " + hiscoreval;
        }
        document.getElementById("scoreBox").innerHTML = "Score: " + score;
        foodCell();
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle = "lime";
    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;
    context.fillRect(snakeX, snakeY, blockSize, blockSize);

    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    if (snakeX < 0 || snakeX >= columns * blockSize || snakeY < 0 || snakeY >= rows * blockSize) {
        gameOverSound.play(); 
        gameOver = true;
        alert("Game Over");
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
            gameOverSound.play(); 
            gameOver = true;
            alert("Game Over");
        }
    }
}

function changeDirection(e) {
    moveSound.play();  
    switch (e.code) {
        case "ArrowUp":
            if (velocityY != 1) {
                velocityX = 0;
                velocityY = -1;
            }
            break;
        case "ArrowDown":
            if (velocityY != -1) {
                velocityX = 0;
                velocityY = 1;
            }
            break;
        case "ArrowLeft":
            if (velocityX != 1) {
                velocityX = -1;
                velocityY = 0;
            }
            break;
        case "ArrowRight":
            if (velocityX != -1) {
                velocityX = 1;
                velocityY = 0;
            }
            break;
    }
}

function foodCell() {
    foodX = Math.floor(Math.random() * columns) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;
}

