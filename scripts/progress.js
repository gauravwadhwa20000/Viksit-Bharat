document.addEventListener('DOMContentLoaded', () => {
    class ProgressTracker {
        constructor() {
            this.totalMissions = 3;
            this.completedMissions = 0;
            this.missionStatus = {
                mission1: false,
                mission2: false,
                mission3: false
            };
            this.init();
        }

        init() {
            // Add hover effects to dots
            const dots = document.querySelectorAll('.mission-dot');
            dots.forEach((dot, index) => {
                dot.addEventListener('mouseenter', () => {
                    if (!this.missionStatus[`mission${index + 1}`]) {
                        dot.style.transform = 'scale(1.1)';
                        dot.style.boxShadow = '0 0 15px rgba(255, 153, 51, 0.3)';
                    }
                });
                dot.addEventListener('mouseleave', () => {
                    if (!this.missionStatus[`mission${index + 1}`]) {
                        dot.style.transform = 'scale(1)';
                        dot.style.boxShadow = 'none';
                    }
                });
            });

        addStyles() {
            // Add styles for completed missions
            const style = document.createElement('style');
            style.textContent = `
                .mission-dot.completed {
                    background: #0F52BA !important;
                    border-color: #0F52BA !important;
                    box-shadow: 0 0 10px rgba(15, 82, 186, 0.3);
                }
                .mission-dot.completed span {
                    color: #0F52BA !important;
                    font-weight: bold;
                }
            `;
            document.head.appendChild(style);
        }

        updateProgress(missionNumber) {
            this.missionStatus[`mission${missionNumber}`] = true;
            this.completedMissions = Object.values(this.missionStatus).filter(status => status).length;
            this.updateUI();
            this.saveProgress();
        }

        loadProgress() {
            const savedProgress = localStorage.getItem('missionProgress');
            if (savedProgress) {
                this.missionStatus = JSON.parse(savedProgress);
                this.completedMissions = Object.values(this.missionStatus).filter(status => status).length;
                this.updateUI();
            }
        }

        saveProgress() {
            localStorage.setItem('missionProgress', JSON.stringify(this.missionStatus));
        }

        updateUI() {
            const progressText = document.querySelector('.progress-text');
            progressText.textContent = `${this.completedMissions}/${this.totalMissions} Missions Complete`;

            const dots = document.querySelectorAll('.mission-dot');
            dots.forEach((dot, index) => {
                if (this.missionStatus[`mission${index + 1}`]) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.remove('completed');
                }
            });
        }

        resetProgress() {
            this.completedMissions = 0;
            this.missionStatus = {
                mission1: false,
                mission2: false,
                mission3: false
            };
            this.saveProgress();
            this.updateUI();
        }
    }

    // Initialize progress tracker
    window.progressTracker = new ProgressTracker();
    window.progressTracker.loadProgress();

    // Add click handlers for play buttons
    document.querySelectorAll('.play-btn').forEach(btn => {
        const missionCard = btn.closest('.mission-card');
        const level = missionCard.dataset.level;

        btn.addEventListener('click', () => {
            const gameContainer = document.getElementById('gameContainer');
            
            if (level === '1') {
                const level1 = new Level1(gameContainer);
                gameContainer.classList.remove('hidden');
                level1.start();
                level1.onComplete = () => {
                    completedMissions++;
                    updateProgress();
                    gameContainer.classList.add('hidden');
                    alert('Mission Completed! You\'ve earned a new badge!');
                };
            }
            // Add other level handlers here
        });
    });

    // Initialize progress
    updateProgress();
});