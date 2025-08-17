class Game {
    constructor() {
        this.completedLevels = new Set();
        this.currentLevel = null;
        this.setupEventListeners();
        this.loadGameState();
    }

    setupEventListeners() {
        // Level buttons
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => this.startLevel(btn.dataset.level));
        });

        // Congrats screen buttons
        document.getElementById('replayAll')?.addEventListener('click', () => this.resetGame());
        document.getElementById('goHome')?.addEventListener('click', () => window.location.href = 'index.html');
        document.getElementById('shareResults')?.addEventListener('click', () => this.shareResults());

        // Audio controls
        const bgMusic = document.getElementById('bgMusic');
        const toggleSound = document.getElementById('toggleSound');
        const soundIcon = document.getElementById('soundIcon');
        let isMusicPlaying = false;

        toggleSound.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                soundIcon.src = 'assets/sound-off.svg';
            } else {
                bgMusic.play();
                soundIcon.src = 'assets/sound-on.svg';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    loadGameState() {
        const saved = localStorage.getItem('viksitBharatGame');
        if (saved) {
            this.completedLevels = new Set(JSON.parse(saved));
            this.updateUI();
        }
    }

    saveGameState() {
        localStorage.setItem('viksitBharatGame', 
            JSON.stringify(Array.from(this.completedLevels)));
    }

    startLevel(levelNum) {
        this.currentLevel = levelNum;
        const gameContainer = document.getElementById('gameContainer');
        gameContainer.classList.remove('hidden');
        
        // Load the appropriate level
        import(`./levels/level${levelNum}.js`)
            .then(module => {
                const level = new module.default(gameContainer);
                level.onComplete = () => this.completeLevel(levelNum);
                level.start();
            })
            .catch(err => console.error('Error loading level:', err));
    }

    completeLevel(levelNum) {
        this.completedLevels.add(levelNum);
        this.saveGameState();
        this.updateUI();
        
        // Show celebration and badge
        this.showBadge(levelNum);
        
        // Check if all levels are complete
        if (this.completedLevels.size === 5) {
            this.showCongratsScreen();
        }
    }

    showBadge(levelNum) {
        const badges = {
            1: { name: 'National Defender', description: 'Mission Sudarshan Chakra completed!' },
            2: { name: 'Border Guardian', description: 'High-Power Demography Mission completed!' },
            3: { name: 'Youth Hire', description: 'PM Viksit Bharat Rozgaar Yojana completed!' },
            4: { name: 'Voice for Local', description: 'Vocal for Local Mission completed!' },
            5: { name: 'Farmer\'s Ally', description: 'Indus Water Treaty Mission completed!' }
        };

        const badge = badges[levelNum];
        // Create and show badge overlay
        const overlay = document.createElement('div');
        overlay.className = 'badge-overlay';
        overlay.innerHTML = `
            <div class="badge-content slide-in">
                <img src="assets/badge${levelNum}.svg" alt="${badge.name}">
                <h3>${badge.name}</h3>
                <p>${badge.description}</p>
                <button class="primary-btn continue-btn">Continue</button>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.querySelector('.continue-btn').addEventListener('click', () => {
            overlay.remove();
            document.getElementById('gameContainer').classList.add('hidden');
        });
    }

    showCongratsScreen() {
        const congratsScreen = document.getElementById('congratsScreen');
        congratsScreen.classList.remove('hidden');
        
        // Display all earned badges
        const badgesGrid = congratsScreen.querySelector('.badges-grid');
        badgesGrid.innerHTML = '';
        
        for (let i = 1; i <= 5; i++) {
            const badgeEl = document.createElement('div');
            badgeEl.className = 'badge-item fade-in';
            badgeEl.style.animationDelay = `${(i - 1) * 0.2}s`;
            badgeEl.innerHTML = `<img src="assets/badge${i}.svg" alt="Level ${i} Badge">`;
            badgesGrid.appendChild(badgeEl);
        }
    }

    shareResults() {
        const shareText = `🎉 I've completed all missions in Mission Viksit Bharat — Decode the Future! Join the journey to build a Viksit Bharat! 🇮🇳 #VikshitBharat #IndependenceDay2025`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Mission Viksit Bharat',
                text: shareText,
                url: window.location.origin
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareText)
                .then(() => alert('Share text copied to clipboard!'))
                .catch(err => console.log('Error copying to clipboard:', err));
        }
    }

    resetGame() {
        this.completedLevels.clear();
        this.saveGameState();
        this.updateUI();
        document.getElementById('congratsScreen').classList.add('hidden');
    }

    updateUI() {
        // Update level indicators
        document.querySelectorAll('.level-indicator').forEach(indicator => {
            const levelNum = indicator.dataset.level;
            const statusImg = indicator.querySelector('.level-status');
            statusImg.src = this.completedLevels.has(levelNum) 
                ? 'assets/completed.svg' 
                : 'assets/pending.svg';
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});