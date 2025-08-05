class PacManGame {
    constructor() {
        this.initializeElements();
        this.initializeGameState();
        this.initializeMenuSystem();
        this.setupEventListeners();
        this.showMainMenu();
    }
    
    initializeElements() {
        // Menu elements
        this.mainMenuEl = document.getElementById('main-menu');
        this.settingsMenuEl = document.getElementById('settings-menu');
        this.highScoresMenuEl = document.getElementById('high-scores-menu');
        this.gameContainerEl = document.getElementById('game-container');
        
        // Game elements
        this.board = document.getElementById('game-board');
        this.currentScoreEl = document.getElementById('current-score');
        this.highScoreEl = document.getElementById('high-score');
        this.livesDisplayEl = document.getElementById('lives-display');
        this.gameStatusEl = document.getElementById('game-status');
        this.playerDisplayEl = document.getElementById('player-display');
        this.difficultyDisplayEl = document.getElementById('difficulty-display');
        
        // Splash screens
        this.gameOverSplashEl = document.getElementById('game-over-splash');
        this.winSplashEl = document.getElementById('win-splash');
        
        // Input elements
        this.playerNameEl = document.getElementById('player-name');
        this.settingsPlayerNameEl = document.getElementById('settings-player-name');
    }
    
    initializeGameState() {
        this.score = 0;
        this.lives = 1;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameWon = false;
        this.powerPelletActive = false;
        this.powerPelletTimer = 0;
        this.invincible = false;
        this.invincibilityTimer = 0;
        
        // Player settings
        this.playerName = 'Player';
        this.difficulty = 'medium';
        
        // High scores
        this.highScores = JSON.parse(localStorage.getItem('pacman-high-scores')) || [];
        this.displayHighScore();
        
        // Game timing
        this.baseSpeed = 200;
        this.ghostSpeed = 300;
        this.speedIncrease = 0;
        this.gameLoop = null;
        this.ghostMoveIntervals = [];
        
        // Initialize Audio System
        this.initializeAudio();
        
        // Enhanced maze with tunnels and safe zones
        this.maze = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
            [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
            [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,1],
            [1,1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1,1],
            [0,0,0,0,1,0,1,3,3,3,3,3,3,3,1,0,1,0,0,0,0],
            [1,1,1,1,1,0,1,3,1,3,3,3,1,3,1,0,1,1,1,1,1],
            [4,0,0,0,0,0,0,3,1,3,3,3,1,3,0,0,0,0,0,0,4],
            [1,1,1,1,1,0,1,3,1,3,3,3,1,3,1,0,1,1,1,1,1],
            [4,0,0,0,0,0,0,3,1,3,3,3,1,3,0,0,0,0,0,0,4],
            [1,1,1,1,1,0,1,3,1,1,1,1,1,3,1,0,1,1,1,1,1],
            [0,0,0,0,1,0,1,3,3,3,3,3,3,3,1,0,1,0,0,0,0],
            [1,1,1,1,1,0,1,1,1,3,1,3,1,1,1,0,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
            [1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
            [1,0,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,0,1],
            [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        // 0 = path, 1 = wall, 2 = power pellet, 3 = safe zone, 4 = tunnel
        
        // Starting positions
        this.pacmanStartPositions = [
            { x: 1, y: 19 },   // bottom-left
            { x: 10, y: 19 },  // bottom-center
            { x: 19, y: 19 }   // bottom-right
        ];
        
        this.ghostStartPositions = [
            { x: 10, y: 9, color: 'red', personality: 'aggressive' },
            { x: 9, y: 10, color: 'pink', personality: 'ambush' },
            { x: 11, y: 10, color: 'cyan', personality: 'patrol' }
        ];
        
        this.resetPositions();
    }
    
    initializeMenuSystem() {
        this.currentMenu = 'main';
        this.difficultySettings = {
            medium: { randomChance: 0.7, chaseChance: 0.3, speedMultiplier: 1.0 },
            hard: { randomChance: 0.4, chaseChance: 0.6, speedMultiplier: 0.8 }
        };
    }
    
    resetPositions() {
        // Random Pac-Man starting position
        const randomStart = this.pacmanStartPositions[Math.floor(Math.random() * this.pacmanStartPositions.length)];
        this.pacman = { ...randomStart, direction: 'right' };
        
        // Reset ghosts to start positions
        this.ghosts = this.ghostStartPositions.map(ghost => ({
            ...ghost,
            direction: 'up',
            vulnerable: false,
            mode: 'chase'
        }));
    }
    
    initializeAudio() {
        this.audioContext = null;
        this.audioEnabled = true;
        this.masterVolume = 0.3;
        this.musicVolume = 0.2;
        this.sfxVolume = 0.4;
        
        // Audio nodes
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // Music variables
        this.baseTempo = 120; // BPM
        this.currentTempo = 120;
        this.beatInterval = null;
        this.musicLoop = null;
        
        // Sound effects
        this.sounds = {};
        
        this.initializeWebAudio();
    }
    
    initializeWebAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Set initial volumes
            this.masterGain.gain.value = this.masterVolume;
            this.musicGain.gain.value = this.musicVolume;
            this.sfxGain.gain.value = this.sfxVolume;
            
            // Connect nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            console.log('Audio system initialized successfully');
        } catch (error) {
            console.warn('Web Audio API not supported', error);
            this.audioEnabled = false;
        }
    }
    
    // Audio utility functions
    createOscillator(frequency, type = 'square', duration = 0.1) {
        if (!this.audioEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 0.1;
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        
        return oscillator;
    }
    
    playPowerUpSound() {
        if (!this.audioEnabled) return;
        
        // Power-up ascending tones
        const frequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sawtooth', 0.15);
            }, index * 100);
        });
        
        // Voice effect simulation with synthesized speech-like tones
        setTimeout(() => {
            this.playVoiceEffect('POWER MODE ACTIVATED!');
        }, 500);
    }
    
    playVoiceEffect(text) {
        if (!this.audioEnabled) return;
        
        // Simulate robotic voice with modulated tones
        const baseFreq = 180;
        const words = text.split(' ');
        
        words.forEach((word, wordIndex) => {
            setTimeout(() => {
                for (let i = 0; i < word.length; i++) {
                    setTimeout(() => {
                        const freq = baseFreq + (word.charCodeAt(i) % 50) * 3;
                        this.createOscillator(freq, 'square', 0.08);
                        this.createOscillator(freq * 1.5, 'square', 0.06); // Harmonic
                    }, i * 60);
                }
            }, wordIndex * 400);
        });
    }
    
    playWakaSound() {
        if (!this.audioEnabled) return;
        
        // Classic Pac-Man waka sound
        this.createOscillator(440, 'square', 0.1);
        setTimeout(() => {
            this.createOscillator(330, 'square', 0.1);
        }, 100);
    }
    
    playGhostEatenSound() {
        if (!this.audioEnabled) return;
        
        // Ascending victory tones
        const frequencies = [440, 554.37, 659.25, 880];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sine', 0.2);
            }, index * 50);
        });
    }
    
    playDeathSound() {
        if (!this.audioEnabled) return;
        
        // Descending death sound
        const frequencies = [523.25, 466.16, 415.30, 369.99, 329.63, 293.66, 261.63];
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'sawtooth', 0.3);
            }, index * 100);
        });
    }
    
    playLevelCompleteSound() {
        if (!this.audioEnabled) return;
        
        // Victory fanfare
        const melody = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.createOscillator(freq, 'triangle', 0.4);
                this.createOscillator(freq * 1.5, 'sine', 0.2); // Harmony
            }, index * 150);
        });
        
        setTimeout(() => {
            this.playVoiceEffect('LEVEL COMPLETE!');
        }, 1200);
    }
    
    startBackgroundMusic() {
        if (!this.audioEnabled || this.musicLoop) return;
        
        this.currentTempo = this.baseTempo;
        this.startBeatSync();
        this.playBackgroundLoop();
    }
    
    stopBackgroundMusic() {
        if (this.musicLoop) {
            clearInterval(this.musicLoop);
            this.musicLoop = null;
        }
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }
    }
    
    startBeatSync() {
        if (this.beatInterval) clearInterval(this.beatInterval);
        
        const beatDuration = (60 / this.currentTempo) * 1000; // Convert BPM to ms
        
        this.beatInterval = setInterval(() => {
            this.onBeat();
        }, beatDuration);
    }
    
    onBeat() {
        // Visual pulse effects on beat
        if (this.gameRunning) {
            // Pulse the game board slightly
            this.board.style.transform = 'scale(1.005)';
            setTimeout(() => {
                this.board.style.transform = 'scale(1)';
            }, 100);
            
            // Sync ghost movement to beat occasionally
            if (Math.random() < 0.3) {
                this.ghosts.forEach(ghost => {
                    const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
                    if (cell) {
                        cell.style.filter = 'brightness(1.3)';
                        setTimeout(() => {
                            cell.style.filter = '';
                        }, 150);
                    }
                });
            }
        }
    }
    
    playBackgroundLoop() {
        if (!this.audioEnabled || this.musicLoop) return;
        
        const bassLine = [130.81, 146.83, 164.81, 174.61]; // C3, D3, E3, F3
        const harmony = [261.63, 293.66, 329.63, 349.23]; // C4, D4, E4, F4
        
        let noteIndex = 0;
        const playNote = () => {
            if (!this.gameRunning && this.currentMenu !== 'game') return;
            
            const bassFreq = bassLine[noteIndex % bassLine.length];
            const harmonyFreq = harmony[noteIndex % harmony.length];
            
            // Create layered background music
            this.createBackgroundTone(bassFreq, 'triangle', 0.8);
            this.createBackgroundTone(harmonyFreq, 'sine', 0.6);
            
            noteIndex++;
        };
        
        this.musicLoop = setInterval(playNote, 500);
    }
    
    createBackgroundTone(frequency, type, duration) {
        if (!this.audioEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.value = 0.05; // Quiet background music
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    updateMusicTempo() {
        // Increase tempo based on game speed and ghost proximity
        const ghostProximity = Math.min(...this.ghosts.map(ghost => 
            Math.abs(ghost.x - this.pacman.x) + Math.abs(ghost.y - this.pacman.y)
        ));
        
        const speedFactor = 1 + (this.speedIncrease / 100);
        const proximityFactor = ghostProximity < 5 ? 1.5 : 1;
        
        this.currentTempo = Math.min(this.baseTempo * speedFactor * proximityFactor, 200);
        
        // Restart beat sync with new tempo
        this.startBeatSync();
    }
    
    setupEventListeners() {
        // Menu navigation
        document.getElementById('start-game-btn').addEventListener('click', () => this.startNewGame());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        document.getElementById('high-scores-btn').addEventListener('click', () => this.showHighScores());
        document.getElementById('back-to-menu-btn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-from-scores-btn').addEventListener('click', () => this.showMainMenu());
        
        // Game controls
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('back-to-main-btn').addEventListener('click', () => this.backToMainMenu());
        
        // Splash screen controls
        document.getElementById('restart-from-splash').addEventListener('click', () => this.startNewGame());
        document.getElementById('menu-from-splash').addEventListener('click', () => this.showMainMenu());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('win-menu-btn').addEventListener('click', () => this.showMainMenu());
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.target.dataset.difficulty));
        });
        
        // Player name inputs with enhanced event handling
        this.playerNameEl.addEventListener('input', (e) => {
            console.log('Player name input:', e.target.value); // Debug log
            this.setPlayerName(e.target.value);
        });
        this.settingsPlayerNameEl.addEventListener('input', (e) => {
            console.log('Settings name input:', e.target.value); // Debug log
            this.setPlayerName(e.target.value);
        });
        
        // Auto-select text when clicking on name fields for easier editing
        this.playerNameEl.addEventListener('focus', (e) => {
            console.log('Player name field focused'); // Debug log
            e.target.select();
        });
        this.settingsPlayerNameEl.addEventListener('focus', (e) => {
            console.log('Settings name field focused'); // Debug log
            e.target.select();
        });
        
        // Ensure input fields can receive focus and input
        this.playerNameEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.focus();
        });
        this.settingsPlayerNameEl.addEventListener('click', (e) => {
            e.stopPropagation();
            e.target.focus();
        });
        
        // Audio controls
        document.getElementById('master-volume').addEventListener('input', (e) => this.setMasterVolume(e.target.value / 100));
        document.getElementById('music-volume').addEventListener('input', (e) => this.setMusicVolume(e.target.value / 100));
        document.getElementById('sfx-volume').addEventListener('input', (e) => this.setSFXVolume(e.target.value / 100));
        document.getElementById('audio-toggle').addEventListener('click', () => this.toggleAudio());
        
        // Game controls
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    setMasterVolume(volume) {
        this.masterVolume = volume;
        if (this.masterGain) {
            this.masterGain.gain.value = volume;
        }
    }
    
    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.musicGain) {
            this.musicGain.gain.value = volume;
        }
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = volume;
        if (this.sfxGain) {
            this.sfxGain.gain.value = volume;
        }
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const toggleBtn = document.getElementById('audio-toggle');
        
        if (this.audioEnabled) {
            toggleBtn.textContent = '🔊 AUDIO ON';
            toggleBtn.classList.remove('disabled');
            if (!this.audioContext) {
                this.initializeWebAudio();
            }
            if (this.gameRunning) {
                this.startBackgroundMusic();
            }
        } else {
            toggleBtn.textContent = '🔇 AUDIO OFF';
            toggleBtn.classList.add('disabled');
            this.stopBackgroundMusic();
        }
    }
    
    handleKeyPress(e) {
        // Don't interfere with typing in input fields
        if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
            return; // Allow normal typing in text inputs
        }
        
        // Only prevent default for game controls
        if (e.code === 'Space' || e.code.startsWith('Arrow')) {
            e.preventDefault();
        }
        
        if (e.code === 'Space') {
            if (this.currentMenu === 'main') {
                this.startNewGame();
            } else if (!this.gameRunning) {
                this.startGame();
            } else {
                this.togglePause();
            }
            return;
        }
        
        if (!this.gameRunning || this.gamePaused || this.currentMenu !== 'game') return;
        
        let newDirection;
        switch (e.code) {
            case 'ArrowUp': newDirection = 'up'; break;
            case 'ArrowDown': newDirection = 'down'; break;
            case 'ArrowLeft': newDirection = 'left'; break;
            case 'ArrowRight': newDirection = 'right'; break;
            default: return;
        }
        
        this.pacman.direction = newDirection;
    }
    
    showMainMenu() {
        this.hideAllScreens();
        this.mainMenuEl.classList.remove('hidden');
        this.currentMenu = 'main';
        this.stopGame();
    }
    
    showSettings() {
        this.hideAllScreens();
        this.settingsMenuEl.classList.remove('hidden');
        this.currentMenu = 'settings';
        
        // Only fill the name field if player has entered a custom name
        if (this.playerName !== 'Player') {
            this.settingsPlayerNameEl.value = this.playerName;
        } else {
            this.settingsPlayerNameEl.value = ''; // Show placeholder instead
        }
        
        this.updateDifficultyButtons();
    }
    
    showHighScores() {
        this.hideAllScreens();
        this.highScoresMenuEl.classList.remove('hidden');
        this.currentMenu = 'high-scores';
        this.displayHighScoresTable();
    }
    
    showGame() {
        this.hideAllScreens();
        this.gameContainerEl.classList.remove('hidden');
        this.currentMenu = 'game';
    }
    
    hideAllScreens() {
        this.mainMenuEl.classList.add('hidden');
        this.settingsMenuEl.classList.add('hidden');
        this.highScoresMenuEl.classList.add('hidden');
        this.gameContainerEl.classList.add('hidden');
        this.gameOverSplashEl.classList.add('hidden');
        this.winSplashEl.classList.add('hidden');
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.updateDifficultyButtons();
        this.difficultyDisplayEl.textContent = difficulty.toUpperCase();
    }
    
    updateDifficultyButtons() {
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === this.difficulty);
        });
    }
    
    setPlayerName(name) {
        // Only set player name if there's actual input, otherwise use default
        this.playerName = name && name.trim() !== '' ? name.trim() : 'Player';
        
        // Don't pre-fill input fields - let placeholder show instead
        if (name && name.trim() !== '') {
            this.playerNameEl.value = name.trim();
            this.settingsPlayerNameEl.value = name.trim();
        } else {
            // Clear the input fields to show placeholder
            this.playerNameEl.value = '';
            this.settingsPlayerNameEl.value = '';
        }
        
        this.playerDisplayEl.textContent = this.playerName.toUpperCase();
    }
    
    startNewGame() {
        this.score = 0;
        this.lives = 1;
        this.level = 1;
        this.speedIncrease = 0;
        
        // Get player name from input, use 'Player' if empty
        const inputName = this.playerNameEl.value.trim();
        this.setPlayerName(inputName);
        
        this.showGame();
        this.createBoard();
        this.updateDisplay();
        this.startGame();
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameWon = false;
        this.gameStatusEl.textContent = "";
        this.board.classList.remove('game-over', 'winner');
        
        // Add brief invincibility period at start
        this.invincible = true;
        this.invincibilityTimer = 30; // About 3 seconds of invincibility
        
        // Start background music
        this.startBackgroundMusic();
        
        const currentSpeed = Math.max(this.baseSpeed - this.speedIncrease, 100);
        const currentGhostSpeed = Math.max(this.ghostSpeed - this.speedIncrease, 150);
        
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.movePacman();
                this.checkCollisions();
                this.checkWinCondition();
                this.updatePowerPellet();
                this.updateInvincibility();
                this.updateMusicTempo(); // Update music based on game state
            }
        }, currentSpeed * this.difficultySettings[this.difficulty].speedMultiplier);
        
        this.startGhostMovement(currentGhostSpeed);
    }
    
    startGhostMovement(speed) {
        this.ghosts.forEach((ghost, index) => {
            const interval = setInterval(() => {
                if (!this.gamePaused && this.gameRunning) {
                    this.moveGhost(ghost);
                }
            }, speed + (index * 50)); // Stagger ghost movements
            this.ghostMoveIntervals.push(interval);
        });
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        this.gameStatusEl.textContent = this.gamePaused ? "PAUSED - Press SPACE to continue" : "";
    }
    
    backToMainMenu() {
        this.stopGame();
        this.showMainMenu();
    }
    
    stopGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        // Stop background music
        this.stopBackgroundMusic();
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.ghostMoveIntervals.forEach(interval => clearInterval(interval));
        this.ghostMoveIntervals = [];
    }
    
    createBoard() {
        this.board.innerHTML = '';
        this.totalDots = 0;
        this.totalPowerPellets = 0;
        
        for (let y = 0; y < 21; y++) {
            for (let x = 0; x < 21; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${x}-${y}`;
                
                const cellType = this.maze[y][x];
                
                switch (cellType) {
                    case 1: // Wall
                        cell.classList.add('wall');
                        break;
                    case 2: // Power pellet
                        cell.classList.add('path', 'power-pellet');
                        this.totalPowerPellets++;
                        break;
                    case 3: // Safe zone
                        cell.classList.add('safe-zone');
                        break;
                    case 4: // Tunnel
                        cell.classList.add('tunnel');
                        break;
                    default: // Path with dot
                        cell.classList.add('path');
                        if (!this.isStartPosition(x, y)) {
                            cell.classList.add('dot');
                            this.totalDots++;
                        }
                        break;
                }
                
                this.board.appendChild(cell);
            }
        }
        
        this.renderPacman();
        this.ghosts.forEach(ghost => this.renderGhost(ghost));
    }
    
    isStartPosition(x, y) {
        // Check if position is Pac-Man start or ghost start
        if (x === this.pacman.x && y === this.pacman.y) return true;
        return this.ghosts.some(ghost => ghost.x === x && ghost.y === y);
    }
    
    movePacman() {
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const move = directions[this.pacman.direction];
        let newX = this.pacman.x + move.x;
        let newY = this.pacman.y + move.y;
        
        // Handle tunnel teleportation
        if (newX < 0) newX = 20;
        if (newX > 20) newX = 0;
        
        // Check boundaries and walls
        if (newY >= 0 && newY < 21 && this.maze[newY][newX] !== 1) {
            this.clearPacman();
            this.pacman.x = newX;
            this.pacman.y = newY;
            
            const currentCell = document.getElementById(`cell-${newX}-${newY}`);
            
            // Check for dot collection
            if (currentCell.classList.contains('dot')) {
                currentCell.classList.remove('dot');
                this.score += 10;
                this.playWakaSound(); // Play waka sound for dot
                this.updateDisplay();
            }
            
            // Check for power pellet collection
            if (currentCell.classList.contains('power-pellet')) {
                currentCell.classList.remove('power-pellet');
                this.score += 50;
                this.activatePowerPellet();
                this.playPowerUpSound(); // Play power-up sound and voice
                this.updateDisplay();
            }
            
            this.renderPacman();
        }
    }
    
    moveGhost(ghost) {
        const directions = ['up', 'down', 'left', 'right'];
        const directionVectors = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        const settings = this.difficultySettings[this.difficulty];
        let bestDirection = ghost.direction;
        
        // Determine behavior based on ghost personality and difficulty
        const shouldChase = Math.random() > settings.randomChance;
        
        if (shouldChase && !ghost.vulnerable) {
            // Chase behavior based on personality
            switch (ghost.personality) {
                case 'aggressive':
                    bestDirection = this.getDirectionToTarget(ghost, this.pacman);
                    break;
                case 'ambush':
                    const ambushTarget = this.getAmbushTarget();
                    bestDirection = this.getDirectionToTarget(ghost, ambushTarget);
                    break;
                case 'patrol':
                    bestDirection = this.getPatrolDirection(ghost);
                    break;
            }
        } else {
            // Random movement or flee if vulnerable
            if (ghost.vulnerable) {
                bestDirection = this.getFleeDirection(ghost);
            } else {
                const validDirections = directions.filter(dir => {
                    const move = directionVectors[dir];
                    const newX = ghost.x + move.x;
                    const newY = ghost.y + move.y;
                    return this.isValidGhostMove(newX, newY);
                });
                
                if (validDirections.length > 0) {
                    bestDirection = validDirections[Math.floor(Math.random() * validDirections.length)];
                }
            }
        }
        
        // Execute move
        const move = directionVectors[bestDirection];
        let newX = ghost.x + move.x;
        let newY = ghost.y + move.y;
        
        // Handle tunnel teleportation
        if (newX < 0) newX = 20;
        if (newX > 20) newX = 0;
        
        if (this.isValidGhostMove(newX, newY)) {
            this.clearGhost(ghost);
            ghost.x = newX;
            ghost.y = newY;
            ghost.direction = bestDirection;
            this.renderGhost(ghost);
        }
    }
    
    getDirectionToTarget(ghost, target) {
        const directions = ['up', 'down', 'left', 'right'];
        const directionVectors = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        let bestDirection = ghost.direction;
        let bestDistance = Infinity;
        
        for (const direction of directions) {
            const move = directionVectors[direction];
            const newX = ghost.x + move.x;
            const newY = ghost.y + move.y;
            
            if (this.isValidGhostMove(newX, newY)) {
                const distance = Math.abs(newX - target.x) + Math.abs(newY - target.y);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestDirection = direction;
                }
            }
        }
        
        return bestDirection;
    }
    
    getAmbushTarget() {
        const directions = {
            up: { x: 0, y: -4 },
            down: { x: 0, y: 4 },
            left: { x: -4, y: 0 },
            right: { x: 4, y: 0 }
        };
        
        const move = directions[this.pacman.direction] || { x: 0, y: 0 };
        return {
            x: Math.max(0, Math.min(20, this.pacman.x + move.x)),
            y: Math.max(0, Math.min(20, this.pacman.y + move.y))
        };
    }
    
    getPatrolDirection(ghost) {
        // Simple patrol pattern - try to maintain distance from Pac-Man
        const distance = Math.abs(ghost.x - this.pacman.x) + Math.abs(ghost.y - this.pacman.y);
        if (distance < 5) {
            return this.getFleeDirection(ghost);
        } else {
            return this.getDirectionToTarget(ghost, this.pacman);
        }
    }
    
    getFleeDirection(ghost) {
        const directions = ['up', 'down', 'left', 'right'];
        const directionVectors = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };
        
        let bestDirection = ghost.direction;
        let bestDistance = -1;
        
        for (const direction of directions) {
            const move = directionVectors[direction];
            const newX = ghost.x + move.x;
            const newY = ghost.y + move.y;
            
            if (this.isValidGhostMove(newX, newY)) {
                const distance = Math.abs(newX - this.pacman.x) + Math.abs(newY - this.pacman.y);
                if (distance > bestDistance) {
                    bestDistance = distance;
                    bestDirection = direction;
                }
            }
        }
        
        return bestDirection;
    }
    
    isValidGhostMove(x, y) {
        if (x < 0 || x > 20 || y < 0 || y > 20) return true; // Allow tunnel movement
        return this.maze[y] && this.maze[y][x] !== 1; // Not a wall
    }
    
    activatePowerPellet() {
        this.powerPelletActive = true;
        this.powerPelletTimer = 100; // About 10 seconds
        
        this.ghosts.forEach(ghost => {
            ghost.vulnerable = true;
        });
        
        this.updateGhostAppearance();
    }
    
    updatePowerPellet() {
        if (this.powerPelletActive) {
            this.powerPelletTimer--;
            if (this.powerPelletTimer <= 0) {
                this.powerPelletActive = false;
                this.ghosts.forEach(ghost => {
                    ghost.vulnerable = false;
                });
                this.updateGhostAppearance();
            }
        }
    }
    
    updateInvincibility() {
        if (this.invincible) {
            this.invincibilityTimer--;
            if (this.invincibilityTimer <= 0) {
                this.invincible = false;
            }
        }
    }
    
    updateGhostAppearance() {
        this.ghosts.forEach(ghost => {
            const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
            if (cell) {
                cell.classList.toggle('vulnerable', ghost.vulnerable);
            }
        });
    }
    
    checkCollisions() {
        // Skip collision detection during invincibility period
        if (this.invincible) return;
        
        this.ghosts.forEach((ghost, index) => {
            if (this.pacman.x === ghost.x && this.pacman.y === ghost.y) {
                if (ghost.vulnerable) {
                    // Eat ghost
                    this.score += 200;
                    this.playGhostEatenSound(); // Play ghost eaten sound
                    this.resetGhost(ghost);
                    this.updateDisplay();
                } else {
                    // Pac-Man hit by ghost
                    this.lives--;
                    this.playDeathSound(); // Play death sound
                    this.updateDisplay();
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.resetPositions();
                        this.clearBoard();
                        this.renderPacman();
                        this.ghosts.forEach(g => this.renderGhost(g));
                    }
                }
            }
        });
    }
    
    resetGhost(ghost) {
        const startPos = this.ghostStartPositions.find(g => g.color === ghost.color);
        ghost.x = startPos.x;
        ghost.y = startPos.y;
        ghost.vulnerable = false;
        ghost.direction = 'up';
        
        this.clearBoard();
        this.renderPacman();
        this.ghosts.forEach(g => this.renderGhost(g));
    }
    
    checkWinCondition() {
        const remainingDots = document.querySelectorAll('.dot').length;
        const remainingPowerPellets = document.querySelectorAll('.power-pellet').length;
        
        if (remainingDots === 0 && remainingPowerPellets === 0) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.gameWon = true;
        this.stopGame();
        this.playLevelCompleteSound(); // Play level complete sound and voice
        this.showWinSplash();
        this.saveHighScore();
    }
    
    nextLevel() {
        this.level++;
        this.speedIncrease += 20; // Increase speed each level
        this.hideAllScreens();
        this.resetPositions();
        this.createBoard();
        this.updateDisplay();
        this.startGame();
        this.showGame();
    }
    
    gameOver() {
        this.stopGame();
        this.showGameOverSplash();
        this.saveHighScore();
    }
    
    showGameOverSplash() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-player').textContent = this.playerName;
        this.gameOverSplashEl.classList.remove('hidden');
    }
    
    showWinSplash() {
        document.getElementById('win-final-score').textContent = this.score;
        document.getElementById('win-final-player').textContent = this.playerName;
        this.winSplashEl.classList.remove('hidden');
    }
    
    saveHighScore() {
        const newScore = {
            name: this.playerName,
            score: this.score,
            level: this.level,
            difficulty: this.difficulty,
            date: new Date().toLocaleDateString()
        };
        
        this.highScores.push(newScore);
        this.highScores.sort((a, b) => b.score - a.score);
        this.highScores = this.highScores.slice(0, 10); // Keep top 10
        
        localStorage.setItem('pacman-high-scores', JSON.stringify(this.highScores));
        this.displayHighScore();
    }
    
    displayHighScore() {
        const topScore = this.highScores.length > 0 ? this.highScores[0].score : 0;
        this.highScoreEl.textContent = topScore;
    }
    
    displayHighScoresTable() {
        const container = document.getElementById('high-scores-content');
        if (this.highScores.length === 0) {
            container.innerHTML = '<p>No high scores yet!</p>';
            return;
        }
        
        let html = '<table style="width: 100%; color: #ffff00;"><tr><th>Rank</th><th>Name</th><th>Score</th><th>Level</th><th>Difficulty</th><th>Date</th></tr>';
        
        this.highScores.forEach((score, index) => {
            html += `<tr>
                <td>${index + 1}</td>
                <td>${score.name}</td>
                <td>${score.score}</td>
                <td>${score.level}</td>
                <td>${score.difficulty.toUpperCase()}</td>
                <td>${score.date}</td>
            </tr>`;
        });
        
        html += '</table>';
        container.innerHTML = html;
    }
    
    clearBoard() {
        document.querySelectorAll('.pacman, .ghost').forEach(el => {
            el.classList.remove('pacman', 'ghost', 'red', 'pink', 'cyan', 'vulnerable', 'up', 'down', 'left', 'right');
        });
    }
    
    renderPacman() {
        const cell = document.getElementById(`cell-${this.pacman.x}-${this.pacman.y}`);
        if (cell) {
            cell.classList.add('pacman', this.pacman.direction);
        }
    }
    
    clearPacman() {
        const currentCell = document.getElementById(`cell-${this.pacman.x}-${this.pacman.y}`);
        if (currentCell) {
            currentCell.classList.remove('pacman', 'up', 'down', 'left', 'right');
        }
    }
    
    renderGhost(ghost) {
        const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (cell) {
            cell.classList.add('ghost', ghost.color);
            if (ghost.vulnerable) {
                cell.classList.add('vulnerable');
            }
        }
    }
    
    clearGhost(ghost) {
        const currentCell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
        if (currentCell) {
            currentCell.classList.remove('ghost', ghost.color, 'vulnerable');
        }
    }
    
    updateDisplay() {
        this.currentScoreEl.textContent = this.score;
        
        // Update lives display
        this.livesDisplayEl.innerHTML = '';
        for (let i = 0; i < this.lives; i++) {
            const life = document.createElement('span');
            life.className = 'life';
            life.textContent = '🟡';
            this.livesDisplayEl.appendChild(life);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PacManGame();
});
