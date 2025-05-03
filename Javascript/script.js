const blockSize = 25;
let rows = 25, cols = 50;
let gameTime = 0;
let timerInterval;
const board = document.getElementById("board");
const context = board.getContext("2d");

const foodSound = new Audio('music/food.mp3');
const moveSound = new Audio('music/move.mp3');
const gameOverSound = new Audio('music/gameover.mp3');

let snakeX, snakeY, velocityX, velocityY, snakeBody;
let foodX, foodY;
let gameOver = false, gamePaused = false;
let score = 0, hiscoreval = 0;
let gameSpeed = 100;
let gameLoopTimeout;
let touchStartX = 0, touchStartY = 0;
let lastFrameTime = 0;

const powerUpTypes = ["speed", "slow", "double"];
let activePowerUp = null;
let powerUpTimer = 0;

let gameMode = "classic";
let walls = [];
let gameTimeLimit = 0;

const particles = [];

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const startOverlay = document.getElementById("startOverlay");
const startGameBtn = document.getElementById("startGameBtn");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const restartGameBtn = document.getElementById("restartGameBtn");
const finalScoreElement = document.getElementById("finalScore");
const newHighScoreElement = document.getElementById("newHighScore");

let hiscore = localStorage.getItem("hiscore");
if (hiscore === null) {
    hiscoreval = 0;
    localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
} else {
    hiscoreval = JSON.parse(hiscore);
    document.getElementById("hiscoreBox").textContent = `HiScore: ${hiscoreval}`;
}

function setCanvasSize() {
    cols = Math.floor(window.innerWidth / blockSize) - 1;
    rows = Math.floor((window.innerHeight - 200) / blockSize) - 1;
    board.width = cols * blockSize;
    board.height = rows * blockSize;
}

function startGame() {
    snakeX = blockSize * 5;
    snakeY = blockSize * 5;
    velocityX = 0;
    velocityY = 0;
    snakeBody = [];
    gameOver = false;
    gamePaused = false;
    score = 0;
    gameSpeed = 100;
    gameTime = 0;

    startBtn.textContent = "Restart";
    pauseBtn.disabled = false;

    updateScore();
    updateTimer();

    if (timerInterval) clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        if (!gamePaused && !gameOver) {
            gameTime++;
            updateTimer();
        }
    }, 1000);

    walls = [];
    switch (gameMode) {
        case "timed":
            gameTimeLimit = 60;
            break;
        case "walls":
            generateWalls();
            break;
    }

    placeFood();
    if (gameLoopTimeout) clearTimeout(gameLoopTimeout);

    lastFrameTime = performance.now();
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (gameOver || gamePaused) return;

    const elapsed = timestamp - lastFrameTime;

    if (elapsed > gameSpeed) {
        lastFrameTime = timestamp;
        update();

        if (particles.length > 0) {
            updateParticles();
        }
    }

    requestAnimationFrame(gameLoop);
}

function update() {
    context.fillStyle = "#000";
    context.fillRect(0, 0, board.width, board.height);

    drawFood();

    if (gameMode === "walls") {
        drawWalls();
    }

    // Food collision check
    if (snakeX === foodX && snakeY === foodY) {
        foodSound.play();
        snakeBody.push([foodX, foodY]);

        const pointValue = (activePowerUp === "double") ? 20 : 10;
        score += pointValue;

        updateScore();
        placeFood();

        if (foodType !== "normal") {
            activatePowerUp(foodType);
        }

        const particleCount = (activePowerUp === "double") ? 30 :
            (foodType === "normal" ? 10 : 20);

        createParticles(foodX + blockSize / 2, foodY + blockSize / 2,
            foodType === "normal" ? "#ff6b6b" : getPowerUpColor(foodType),
            foodType === "normal" ? 10 : 20);

        if (score % 50 === 0 && gameSpeed > 20) {
            gameSpeed -= 10;
        }
    }

    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = [...snakeBody[i - 1]];
    }
    if (snakeBody.length) snakeBody[0] = [snakeX, snakeY];

    snakeX += velocityX * blockSize;
    snakeY += velocityY * blockSize;

    if (gameMode === "walls") {
            if (snakeX < 0 || snakeX >= cols * blockSize ||
                snakeY < 0 || snakeY >= rows * blockSize) {
                gameOverSound.play();
                endGame();
                return;
            }

            for (let i = 0; i < walls.length; i++) {
                if (snakeX === walls[i][0] && snakeY === walls[i][1]) {
                    gameOverSound.play();
                    endGame();
                    return;
                }
            }
        } else {
            if (snakeX < 0) snakeX = (cols - 1) * blockSize;
            else if (snakeX >= cols * blockSize) snakeX = 0;
            if (snakeY < 0) snakeY = (rows - 1) * blockSize;
            else if (snakeY >= rows * blockSize) snakeY = 0;
        }
    

    drawSnake();

    if (particles.length > 0) {
        updateParticles();
    }

    // Check for self-collision
    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX === snakeBody[i][0] && snakeY === snakeBody[i][1]) {
            gameOverSound.play();
            endGame();
            return;
        }
    }

    if (gameMode === "timed" && gameTimeLimit <= gameTime) {
        endGame();
    }
}

function endGame() {
    gameOver = true;
    clearTimeout(gameLoopTimeout);
    clearInterval(timerInterval);
    pauseBtn.disabled = true;

    context.fillStyle = "rgba(255, 0, 0, 0.3)";
    context.fillRect(0, 0, board.width, board.height);

    if (gameOverOverlay && finalScoreElement) {
        finalScoreElement.textContent = `Score: ${score}`;

        const isNewHighScore = score >= hiscoreval;
        if (isNewHighScore && newHighScoreElement) {
            newHighScoreElement.style.display = "block";
        } else if (newHighScoreElement) {
            newHighScoreElement.style.display = "none";
        }
        gameOverOverlay.classList.add("active");
    } else {
        context.font = "bold 50px sans-serif";
        context.fillStyle = "#fff";
        context.textAlign = "center";
        context.fillText("GAME OVER", board.width / 2, board.height / 2);
        context.font = "25px sans-serif";
        context.fillText(`Final Score: ${score}`, board.width / 2, board.height / 2 + 40);
    }
}

function togglePause() {
    if (gameOver) return;
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
    if (!gamePaused) gameLoop();
}

function drawSnake() {
    context.fillStyle = "#00aa00";
    for (let i = 0; i < snakeBody.length; i++) {
        drawRoundedRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize, 6);
    }
    context.fillStyle = "#00ff00";
    drawRoundedRect(snakeX, snakeY, blockSize, blockSize, 8);
}

function drawRoundedRect(x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.fill();
}

function drawFood() {
    const pulseFactor = Math.sin(Date.now() / 200) * 0.1 + 1;
    const radius = (blockSize / 2 - 2) * pulseFactor;

    context.fillStyle = foodType === "normal" ? "#ff6b6b" : getPowerUpColor(foodType);
    context.shadowColor = foodType === "normal" ? "#ff6b6b" : getPowerUpColor(foodType);
    context.shadowBlur = foodType === "normal" ? 5 : 15;

    context.beginPath();
    context.arc(foodX + blockSize / 2, foodY + blockSize / 2, radius, 0, 2 * Math.PI);
    context.fill();

    context.shadowBlur = 0;
}

function drawWalls() {
    context.fillStyle = "#774433";
    for (const [wallX, wallY] of walls) {
        context.fillRect(wallX, wallY, blockSize, blockSize);
    }
}

function placeFood() {
    foodX = Math.floor(Math.random() * cols) * blockSize;
    foodY = Math.floor(Math.random() * rows) * blockSize;

    foodType = Math.random() < 0.3 ? powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)] : "normal";

    if (foodType !== "normal" && activePowerUp) {
        clearPowerUp();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if ((foodX === snakeBody[i][0] && foodY === snakeBody[i][1]) ||
            (foodX === snakeX && foodY === snakeY)) {
            placeFood();
            return;
        }
    }

    if (gameMode === "walls") {
        for (let i = 0; i < walls.length; i++) {
            if (foodX === walls[i][0] && foodY === walls[i][1]) {
                placeFood();
                return;
            }
        }
    }
}

function generateWalls() {
    const wallCount = Math.floor(Math.random() * 10) + 1;

    for (let i = 0; i < wallCount; i++) {
        const wallX = Math.floor(Math.random() * (cols - 4) + 2) * blockSize;
        const wallY = Math.floor(Math.random() * (rows - 4) + 2) * blockSize;
        const isHorizontal = Math.random() > 0.5;
        const length = Math.floor(Math.random() * 5) + 3;

        for (let j = 0; j < length; j++) {
            walls.push([
                wallX + (isHorizontal ? j * blockSize : 0),
                wallY + (!isHorizontal ? j * blockSize : 0)
            ]);
        }
    }
}

function activatePowerUp(type) {
    activePowerUp = type;
    powerUpTimer = 10;

    switch (type) {
        case "speed":
            gameSpeed = Math.max(gameSpeed - 30, 40);
            break;
        case "slow":
            gameSpeed = gameSpeed + 30;
            break;
        case "double":
            document.getElementById("scoreBox").classList.add("double-score");
            break;
    }

    const powerUpIndicator = document.createElement("div");
    powerUpIndicator.id = "powerUpIndicator";
    powerUpIndicator.textContent = `${type.toUpperCase()}: ${powerUpTimer}s`;
    powerUpIndicator.className = "power-up-indicator";
    document.querySelector(".container").appendChild(powerUpIndicator);

    const powerUpInterval = setInterval(() => {
        powerUpTimer--;
        if (powerUpTimer <= 0) {
            clearPowerUp();
            clearInterval(powerUpInterval);
        } else if (document.getElementById("powerUpIndicator")) {
            document.getElementById("powerUpIndicator").textContent =
                `${type.toUpperCase()}: ${powerUpTimer}s`;
        }
    }, 1000);
}

function clearPowerUp() {
    const indicator = document.getElementById("powerUpIndicator");
    if (indicator) indicator.remove();

    if (activePowerUp === "speed" || activePowerUp === "slow") {
        gameSpeed = 100 - Math.floor(score / 50) * 10;
    } else if (activePowerUp === "double") {
        document.getElementById("scoreBox").classList.remove("double-score");
    }

    activePowerUp = null;
}

function getPowerUpColor(type) {
    switch (type) {
        case "speed": return "#ffcc00";
        case "slow": return "#00ccff";
        case "double": return "#ff66cc";
        default: return "#ff6b6b";
    }
}

function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 2,
            color: color,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            life: 30
        });
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].x += particles[i].speedX;
        particles[i].y += particles[i].speedY;
        particles[i].life--;

        context.globalAlpha = particles[i].life / 30;
        context.fillStyle = particles[i].color;
        context.beginPath();
        context.arc(particles[i].x, particles[i].y, particles[i].size, 0, Math.PI * 2);
        context.fill();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    context.globalAlpha = 1;
}

function updateScore() {
    document.getElementById("scoreBox").textContent = `Score: ${score}`;
    if (score > hiscoreval) {
        hiscoreval = score;
        localStorage.setItem("hiscore", JSON.stringify(hiscoreval));
    }
    document.getElementById("hiscoreBox").textContent = `HiScore: ${hiscoreval}`;
}

function updateTimer() {
    const timerBox = document.getElementById("timerBox");
    if (timerBox) {
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        timerBox.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

function handleKeyPress(e) {
    if ((e.code === "KeyP" || e.code === "Escape") && !pauseBtn.disabled) {
        togglePause();
        return;
    }
    if (gamePaused) return;
    moveSound.play();
    switch (e.code) {
        case "ArrowUp":
        case "KeyW":
            if (velocityY !== 1) { velocityX = 0; velocityY = -1; }
            break;
        case "ArrowDown":
        case "KeyS":
            if (velocityY !== -1) { velocityX = 0; velocityY = 1; }
            break;
        case "ArrowLeft":
        case "KeyA":
            if (velocityX !== 1) { velocityX = -1; velocityY = 0; }
            break;
        case "ArrowRight":
        case "KeyD":
            if (velocityX !== -1) { velocityX = 1; velocityY = 0; }
            break;
    }
}

document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        gameMode = btn.dataset.mode;
    });
});

window.addEventListener("resize", () => {
    setCanvasSize();
    if (!gameOver) placeFood();
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
document.addEventListener("keydown", handleKeyPress);

if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
        startOverlay.classList.remove("active");
        startGame();
    });
}

if (restartGameBtn) {
    restartGameBtn.addEventListener("click", () => {
        gameOverOverlay.classList.remove("active");
        startGame();
    });
}

document.addEventListener("touchstart", e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.getElementById("upBtn").addEventListener("click", () => {
    if (velocityY !== 1) { velocityX = 0; velocityY = -1; }
});
document.getElementById("downBtn").addEventListener("click", () => {
    if (velocityY !== -1) { velocityX = 0; velocityY = 1; }
});
document.getElementById("leftBtn").addEventListener("click", () => {
    if (velocityX !== 1) { velocityX = -1; velocityY = 0; }
});
document.getElementById("rightBtn").addEventListener("click", () => {
    if (velocityX !== -1) { velocityX = 1; velocityY = 0; }
});

document.addEventListener("touchend", e => {
    if (gamePaused || gameOver) return;

    let deltaX = e.changedTouches[0].clientX - touchStartX;
    let deltaY = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > 30 && velocityX !== -1) { velocityX = 1; velocityY = 0; }
        else if (deltaX < -30 && velocityX !== 1) { velocityX = -1; velocityY = 0; }
    } else {
        if (deltaY > 30 && velocityY !== -1) { velocityX = 0; velocityY = 1; }
        else if (deltaY < -30 && velocityY !== 1) { velocityX = 0; velocityY = -1; }
    }
});
document.addEventListener('DOMContentLoaded', function () {
    const infoBtn = document.getElementById('infoBtn');
    const infoOverlay = document.getElementById('infoOverlay');
    const closeInfoBtn = document.getElementById('closeInfoBtn');

    infoBtn.addEventListener('click', function () {
        infoOverlay.classList.add('active');
    });

    closeInfoBtn.addEventListener('click', function () {
        infoOverlay.classList.remove('active');
    });

    const gameModeSelector = document.createElement("div");
    gameModeSelector.innerHTML = `
      <div class="mode-selector">
        <button class="mode-btn active" data-mode="classic">Classic</button>
        <button class="mode-btn" data-mode="timed">Timed (60s)</button>
        <button class="mode-btn" data-mode="walls">Walls</button>
      </div>
    `;
    document.querySelector("#startOverlay .overlay-content").appendChild(gameModeSelector);

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            gameMode = btn.dataset.mode;
        });
    });

    const settingsButton = document.createElement("button");
    settingsButton.id = "settingsBtn";
    settingsButton.className = "game-button settings-button";
    settingsButton.innerHTML = "⚙️";
    document.querySelector(".button-container").appendChild(settingsButton);

    document.getElementById("settingsBtn").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.add("active");
    });

    document.getElementById("closeSettingsBtn").addEventListener("click", () => {
        document.getElementById("settingsOverlay").classList.remove("active");

        const difficulty = document.getElementById("difficultySelect").value;
        const soundEnabled = document.getElementById("soundToggle").checked;

        switch (difficulty) {
            case "easy": gameSpeed = 120; break;
            case "medium": gameSpeed = 100; break;
            case "hard": gameSpeed = 70; break;
        }

        foodSound.muted = moveSound.muted = gameOverSound.muted = !soundEnabled;
    });
});

// Initialize canvas on load
setCanvasSize();