document.addEventListener('DOMContentLoaded', () => {
    const progressTracker = {
        totalMissions: 3,
        missionStatus: {
            mission1: false,
            mission2: false,
            mission3: false
        },

        init() {
            this.loadProgress();
            // Only setup dot effects if we're on a page that has mission dots
            if (document.querySelector('.mission-dot')) {
                this.setupDotEffects();
            }
        },

        setupDotEffects() {
            const dots = document.querySelectorAll('.mission-dot');
            if (!dots.length) return;

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
        },

        updateProgress(missionNumber) {
            this.missionStatus[`mission${missionNumber}`] = true;
            this.saveProgress();
            
            // Only update UI if we're on a page with mission dots
            const dots = document.querySelectorAll('.mission-dot');
            if (dots.length > 0) {
                this.updateUI();
                
                // Play completion animation only if dot exists
                const dot = dots[missionNumber - 1];
                if (dot) {
                    dot.classList.add('completed');
                }
            }
        },

        loadProgress() {
            const savedProgress = localStorage.getItem('missionProgress');
            if (savedProgress) {
                this.missionStatus = JSON.parse(savedProgress);
                // Only update UI if we're on a page with mission dots
                if (document.querySelector('.mission-dot')) {
                    this.updateUI();
                }
            }
        },

        saveProgress() {
            localStorage.setItem('missionProgress', JSON.stringify(this.missionStatus));
        },

        updateUI() {
            const dots = document.querySelectorAll('.mission-dot');
            if (!dots.length) return;

            dots.forEach((dot, index) => {
                if (this.missionStatus[`mission${index + 1}`]) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.remove('completed');
                }
            });
        }
    };

    // Initialize progress tracker
    progressTracker.init();
    window.progressTracker = progressTracker;

    // Check for completion on page load, but only if we're on a page with mission dots
    if (document.querySelector('.mission-dot')) {
        const completedLevels = localStorage.getItem('completedLevels');
        if (completedLevels) {
            const levels = JSON.parse(completedLevels);
            levels.forEach(level => progressTracker.updateProgress(level));
        }
    }
});