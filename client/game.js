// Main game logic
class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        this.playerName = null;
        this.playerId = null;
        this.playerShape = null;
        this.players = {};
        this.coins = [];
        this.gameStarted = false;
        this.timeRemaining = 180;
        this.lastFrameTime = Date.now();
        
        this.keys = {};
        this.lastInputTime = 0;
        this.inputCooldown = 50; // ms between inputs
        
        this.setupEventListeners();
        this.startAnimationLoop();
    }

    setupCanvas() {
        // Set canvas size based on map dimensions (scaled for display)
        const scale = 0.8;
        this.canvas.width = 800 * scale;
        this.canvas.height = 600 * scale;
        this.scaleX = this.canvas.width / 800;
        this.scaleY = this.canvas.height / 600;
    }

    setupEventListeners() {
        // Name input
        document.getElementById('connect-btn').addEventListener('click', () => {
            const name = document.getElementById('player-name-input').value.trim();
            if (name) {
                this.connectToServer(name);
            } else {
                document.getElementById('name-error').textContent = 'Please enter a name';
            }
        });

        // Enter key for name input
        document.getElementById('player-name-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('connect-btn').click();
            }
        });

        // Start game button
        document.getElementById('start-now-btn').addEventListener('click', () => {
            window.network.send({ type: 'start_game' });
        });

        // Play again button
        document.getElementById('play-again-btn').addEventListener('click', () => {
            location.reload();
        });

        // Keyboard input
        window.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            const now = Date.now();
            if (now - this.lastInputTime < this.inputCooldown) return;
            
            let direction = null;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                direction = 'up';
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                direction = 'down';
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                direction = 'left';
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                direction = 'right';
            }
            
            if (direction) {
                e.preventDefault();
                this.lastInputTime = now;
                window.network.send({
                    type: 'input',
                    dir: direction
                });
            }
        });
    }

    async connectToServer(name) {
        try {
            const serverUrl = `ws://localhost:8000`;
            await window.network.connect(serverUrl);
            
            // Send connection message
            window.network.send({
                type: 'connected',
                name: name
            });
            
            // Show lobby screen
            document.getElementById('name-screen').classList.add('hidden');
            document.getElementById('lobby-screen').classList.remove('hidden');
        } catch (error) {
            document.getElementById('name-error').textContent = 'Failed to connect to server';
            console.error('Connection error:', error);
        }
    }

    handleServerMessage(message) {
        switch (message.type) {
            case 'connected':
                this.playerName = message.name;
                this.playerId = message.id;
                this.playerShape = message.shape;
                break;
                
            case 'lobby_update':
                this.updateLobby(message);
                break;
                
            case 'game_start':
                this.startGame(message);
                break;
                
            case 'state':
                this.updateGameState(message);
                break;
                
            case 'game_end':
                this.endGame(message);
                break;
                
            case 'error':
                alert(message.message);
                break;
        }
    }

    updateLobby(message) {
        const statusEl = document.getElementById('lobby-status');
        const playersEl = document.getElementById('lobby-players');
        const timerEl = document.getElementById('auto-start-timer');
        
        if (message.player_count >= 2) {
            statusEl.textContent = `${message.player_count} players ready!`;
            timerEl.classList.remove('hidden');
            this.startAutoStartTimer();
        } else {
            statusEl.textContent = `Waiting for another player... (${message.player_count}/2)`;
            timerEl.classList.add('hidden');
        }
    }

    startAutoStartTimer() {
        let countdown = 15;
        const countdownEl = document.getElementById('timer-countdown');
        
        const timer = setInterval(() => {
            countdown--;
            countdownEl.textContent = countdown;
            
            if (countdown <= 0) {
                clearInterval(timer);
                // Auto-start the game when timer reaches 0
                if (!this.gameStarted) {
                    window.network.send({ type: 'start_game' });
                }
            }
            
            if (this.gameStarted) {
                clearInterval(timer);
            }
        }, 1000);
    }

    startGame(message) {
        this.gameStarted = true;
        document.getElementById('lobby-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // Initialize players from message
        for (const [name, data] of Object.entries(message.players)) {
            this.players[name] = {
                id: data.id,
                shape: data.shape,
                x: 0,
                y: 0,
                score: 0
            };
        }
    }

    updateGameState(message) {
        if (!this.gameStarted) return;
        
        // Update players
        for (const [name, data] of Object.entries(message.players)) {
            if (!this.players[name]) {
                this.players[name] = {
                    id: data.id,
                    shape: data.shape,
                    x: data.x,
                    y: data.y,
                    score: data.score
                };
            } else {
                // Update target position for interpolation
                window.interpolation.updateTargetPosition(name, data.x, data.y);
                this.players[name].score = data.score;
            }
        }
        
        // Update coins
        this.coins = message.coins;
        
        // Update timer
        if (message.time_remaining !== null && message.time_remaining !== undefined) {
            this.timeRemaining = message.time_remaining;
        }
        
        // Update scoreboard
        this.updateScoreboard();
    }

    updateScoreboard() {
        const scoresEl = document.getElementById('scores');
        scoresEl.innerHTML = '';
        
        for (const [name, player] of Object.entries(this.players)) {
            const scoreItem = document.createElement('div');
            const isCurrentPlayer = name === this.playerName;
            scoreItem.textContent = `${isCurrentPlayer ? 'You' : name}: ${player.score}`;
            if (isCurrentPlayer) {
                scoreItem.style.fontWeight = 'bold';
            }
            scoresEl.appendChild(scoreItem);
        }
    }

    endGame(message) {
        this.gameStarted = false;
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('end-screen').classList.remove('hidden');
        
        const endTitle = document.getElementById('end-title');
        const finalScores = document.getElementById('final-scores');
        
        if (message.winner) {
            endTitle.textContent = `${message.winner} Wins!`;
        } else {
            endTitle.textContent = 'Game Over';
        }
        
        finalScores.innerHTML = '';
        for (const [name, score] of Object.entries(message.scores)) {
            const scoreItem = document.createElement('div');
            scoreItem.textContent = `${name}: ${score}`;
            if (name === message.winner) {
                scoreItem.classList.add('winner');
            }
            finalScores.appendChild(scoreItem);
        }
    }

    startAnimationLoop() {
        const animate = () => {
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameStarted) {
            return;
        }
        
        // Use performance.now() for more accurate timing
        const currentTime = performance.now();
        
        // Update timer display
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = Math.floor(this.timeRemaining % 60);
        document.getElementById('time-remaining').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        // Draw coins
        this.ctx.fillStyle = '#FFD700';
        for (const coin of this.coins) {
            const x = coin.x * this.scaleX;
            const y = coin.y * this.scaleY;
            const radius = 2 * this.scaleX;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw players with interpolation
        for (const [name, player] of Object.entries(this.players)) {
            const interpolated = window.interpolation.getInterpolatedPosition(name, currentTime);
            let x, y;
            
            if (interpolated) {
                x = interpolated.x * this.scaleX;
                y = interpolated.y * this.scaleY;
            } else {
                x = player.x * this.scaleX;
                y = player.y * this.scaleY;
            }
            
            const size = 2 * this.scaleX;
            const isCurrentPlayer = name === this.playerName;
            
            // Draw player shape
            this.ctx.fillStyle = isCurrentPlayer ? '#4CAF50' : '#2196F3';
            this.ctx.strokeStyle = isCurrentPlayer ? '#2E7D32' : '#1565C0';
            this.ctx.lineWidth = 2;
            
            if (player.shape === 0) {
                // Circle
                this.ctx.beginPath();
                this.ctx.arc(x, y, size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
            } else {
                // Square
                this.ctx.fillRect(x - size, y - size, size * 2, size * 2);
                this.ctx.strokeRect(x - size, y - size, size * 2, size * 2);
            }
            
            // Draw player name
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(name, x, y - size - 10);
        }
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

