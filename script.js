document.addEventListener('DOMContentLoaded', () => {
    // Declare variables at the top
    let gameBoard, scoreElement, highScoreElement, startButton, resetHighScoreButton, 
        welcomeModal, welcomeStartButton, gameOverOverlay, finalScoreElement, restartButton, 
        congratsMessage, confettiContainer, pauseOverlay, infoIcon, infoModal, closeInfoButton;

    const gridSize = 20;
    const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
    let snake = [{ x: 10, y: 10 }];
    let food;
    let direction = 'right';
    let gameInterval;
    let score = 0;
    let highScore = 0;
    let gameActive = false;
    let gameSpeed = 200; // Initial game speed in milliseconds
    let isPaused = false;

    // Initialize DOM elements
    function initializeElements() {
        gameBoard = document.getElementById('gameBoard');
        scoreElement = document.getElementById('score');
        highScoreElement = document.getElementById('highScore');
        startButton = document.getElementById('startButton');
        resetHighScoreButton = document.getElementById('resetHighScore');
        welcomeModal = document.getElementById('welcomeModal');
        welcomeStartButton = document.getElementById('welcomeStartButton');
        gameOverOverlay = document.getElementById('gameOverOverlay');
        finalScoreElement = document.getElementById('finalScore');
        restartButton = document.getElementById('restartButton');
        congratsMessage = document.getElementById('congratsMessage');
        confettiContainer = document.getElementById('confetti-container');
        pauseOverlay = document.getElementById('pauseOverlay');
        infoIcon = document.getElementById('infoIcon');
        infoModal = document.getElementById('infoModal');
        closeInfoButton = document.querySelector('#infoModal .close-button');

        // Check if all elements are found
        if (!gameBoard || !scoreElement || !highScoreElement || !startButton || !resetHighScoreButton || 
            !welcomeModal || !welcomeStartButton || !gameOverOverlay || !finalScoreElement || !restartButton || 
            !congratsMessage || !confettiContainer || !pauseOverlay || !infoIcon || !infoModal || !closeInfoButton) {
            console.error('Some DOM elements are missing. Please check your HTML.');
        }

        // Add these lines
        const gameContainer = document.querySelector('.game-container');
        const touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        touchControls.innerHTML = `
            <button id="upButton">↑</button>
            <button id="leftButton">←</button>
            <button id="rightButton">→</button>
            <button id="downButton">↓</button>
        `;
        gameContainer.appendChild(touchControls);
    }

    // Call the function to initialize elements
    initializeElements();

    // Function to get random food position
    function getRandomFoodPosition() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize),
                isSpecial: Math.random() < 0.2 // 20% chance for special food
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    function drawGame() {
        if (!gameBoard) {
            console.error('gameBoard is not defined');
            return;
        }
        gameBoard.innerHTML = '';
        snake.forEach((segment, index) => {
            const snakeElement = document.createElement('div');
            snakeElement.style.gridRowStart = segment.y + 1;
            snakeElement.style.gridColumnStart = segment.x + 1;
            snakeElement.classList.add('snake');
            if (index === 0) snakeElement.classList.add('snake-head');
            gameBoard.appendChild(snakeElement);
        });

        if (food) {
            const foodElement = document.createElement('div');
            foodElement.style.gridRowStart = food.y + 1;
            foodElement.style.gridColumnStart = food.x + 1;
            foodElement.classList.add('food');
            if (food.isSpecial) foodElement.classList.add('special-food');
            gameBoard.appendChild(foodElement);
        }
    }

    function moveSnake() {
        if (isPaused) return;

        const head = { ...snake[0] };
        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
            gameOver();
            return;
        }

        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        if (food && head.x === food.x && head.y === food.y) {
            score += food.isSpecial ? 5 : 1;
            foodEaten = true;
            scoreElement.textContent = score;
            food = getRandomFoodPosition();
            increaseSpeed();
        } else {
            snake.pop();
        }
    }

    function increaseSpeed() {
        if (score % 5 === 0 && gameSpeed > 50) {
            gameSpeed -= 10;
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }
    }

    function gameLoop() {
        moveSnake();
        drawGame();
    }

    function gameOver() {
        gameActive = false;
        clearInterval(gameInterval);
        finalScoreElement.textContent = score;
        gameOverOverlay.style.display = 'flex';
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            highScoreElement.textContent = highScore;
            congratsMessage.style.display = 'block';
            createConfetti();
        } else {
            congratsMessage.style.display = 'none';
        }
        startButton.textContent = 'RESTART';
    }

    function startGame() {
        resetGame();
        welcomeModal.style.display = 'none';
        gameOverOverlay.style.display = 'none';
        gameActive = true;
        startButton.textContent = 'RESTART';
        clearConfetti();
        gameInterval = setInterval(gameLoop, gameSpeed);
    }

    function resetGame() {
        snake = [{ x: 10, y: 10 }];
        food = getRandomFoodPosition();
        direction = 'right';
        score = 0;
        foodEaten = false;
        scoreElement.textContent = score;
        clearInterval(gameInterval);
        gameActive = true;
        isPaused = false;
        pauseOverlay.style.display = 'none';
        gameSpeed = 200; // Reset game speed
    }

    function createConfetti() {
        for (let i = 0; i < 100; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.opacity = Math.random();
            confettiContainer.appendChild(confetti);

            confetti.animate([
                { transform: 'translate3d(0,0,0)', opacity: confetti.style.opacity },
                { transform: `translate3d(${Math.random() * 100 - 50}px, 100vh, 0)`, opacity: '0' }
            ], {
                duration: parseFloat(confetti.style.animationDuration) * 1000,
                easing: 'cubic-bezier(0,0,0.2,1)',
                fill: 'forwards'
            });
        }
    }

    function clearConfetti() {
        if (confettiContainer) {
            confettiContainer.innerHTML = '';
        }
    }

    function resetHighScore() {
        highScore = 0;
        localStorage.removeItem('snakeHighScore');
        highScoreElement.textContent = highScore;
    }

    function pauseGame() {
        isPaused = !isPaused;
        if (isPaused) {
            clearInterval(gameInterval);
            pauseOverlay.style.display = 'flex';
        } else {
            gameInterval = setInterval(gameLoop, gameSpeed);
            pauseOverlay.style.display = 'none';
        }
    }

    function showInfoModal() {
        const modal = document.getElementById('infoModal');
        modal.style.display = 'flex';
    }

    function closeInfoModal() {
        const modal = document.getElementById('infoModal');
        modal.style.display = 'none';
    }

    function handleOutsideClick(event) {
        const modal = document.getElementById('infoModal');
        const infoIcon = document.getElementById('infoIcon');
        
        if (modal.style.display === 'flex' && event.target !== modal && !modal.contains(event.target) && event.target !== infoIcon) {
            closeInfoModal();
        }
    }

    function addTouchControls() {
        const upButton = document.getElementById('upButton');
        const downButton = document.getElementById('downButton');
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');

        upButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (direction !== 'down') direction = 'up';
        });
        downButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (direction !== 'up') direction = 'down';
        });
        leftButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (direction !== 'right') direction = 'left';
        });
        rightButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (direction !== 'left') direction = 'right';
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (!gameActive) {
                startGame();
            }
        }
        if (e.key === 'p' || e.key === 'P') {
            if (gameActive) {
                pauseGame();
            }
        }
        if (!gameActive || isPaused) return;
        switch (e.key) {
            case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
            case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
            case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
            case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
        }
    });

    startButton.addEventListener('click', startGame);
    welcomeStartButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    resetHighScoreButton.addEventListener('click', resetHighScore);

    infoIcon.addEventListener('click', showInfoModal);

    closeInfoButton.addEventListener('click', closeInfoModal);

    // Add this new event listener
    document.addEventListener('mousedown', handleOutsideClick);

    // Load high score from localStorage
    if (localStorage.getItem('snakeHighScore')) {
        highScore = parseInt(localStorage.getItem('snakeHighScore'));
        highScoreElement.textContent = highScore;
    }

    // Show welcome modal on page load
    welcomeModal.style.display = 'flex';

    // Initial draw
    food = getRandomFoodPosition();
    drawGame();

    addTouchControls();
});