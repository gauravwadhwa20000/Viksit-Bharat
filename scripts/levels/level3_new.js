class Level3 {
    constructor() {
        this.jobsCollected = 0;
        this.isGameActive = true;
        this.jobSeeker = null;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.jobInterval = null;
        this.gameSpace = null;

        // Available job offers
        this.jobTypes = [
            { title: "Job Offer", img: "assets/job.png" },
            { title: "Job Offer", img: "assets/job1.png" },
            { title: "Job Offer", img: "assets/job2.png" },
            { title: "Job Offer", img: "assets/job3.png" },
            { title: "Job Offer", img: "assets/job4.png" }
        ];

        this.init();
    }

    init() {
        this.jobSeeker = document.getElementById('jobSeeker');
        this.gameSpace = document.querySelector('.game-space');
        this.moveSpeed = 10; // pixels to move per keypress
        this.isMovingLeft = false;
        this.isMovingRight = false;
        this.setupEventListeners();
        this.startJobSpawning();
        this.setupKeyboardControls();
    }

    setupKeyboardControls() {
        // Handle key press events
        document.addEventListener('keydown', (e) => {
            if (!this.isGameActive) return;
            
            if (e.key === 'ArrowLeft') {
                this.isMovingLeft = true;
                this.movePlayer();
            } else if (e.key === 'ArrowRight') {
                this.isMovingRight = true;
                this.movePlayer();
            }
        });

        // Handle key release events
        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') {
                this.isMovingLeft = false;
            } else if (e.key === 'ArrowRight') {
                this.isMovingRight = false;
            }
        });
    }

    movePlayer() {
        if (!this.isGameActive) return;

        const gameArea = document.querySelector('.game-area');
        const gameRect = gameArea.getBoundingClientRect();
        const currentLeft = parseInt(this.jobSeeker.style.left) || 0;

        if (this.isMovingLeft || this.isMovingRight) {
            let newLeft = currentLeft;
            
            if (this.isMovingLeft) {
                newLeft = Math.max(0, currentLeft - this.moveSpeed);
            }
            if (this.isMovingRight) {
                newLeft = Math.min(gameRect.width - this.jobSeeker.offsetWidth, currentLeft + this.moveSpeed);
            }

            this.jobSeeker.style.left = `${newLeft}px`;

            // Continue moving if key is still held
            if (this.isMovingLeft || this.isMovingRight) {
                requestAnimationFrame(() => this.movePlayer());
            }
        }
    }

    setupEventListeners() {
        // Mouse down event to start dragging
        this.jobSeeker.addEventListener('mousedown', (e) => {
            if (!this.isGameActive) return;
            
            this.isDragging = true;
            const rect = this.jobSeeker.getBoundingClientRect();
            this.dragStartPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            e.preventDefault();
        });

        // Mouse move event for dragging
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            const gameArea = document.querySelector('.game-area');
            const gameRect = gameArea.getBoundingClientRect();
            let newLeft = e.clientX - gameRect.left - this.dragStartPos.x;
            
            // Constrain horizontal movement
            newLeft = Math.max(0, Math.min(newLeft, gameRect.width - this.jobSeeker.offsetWidth));
            
            this.jobSeeker.style.left = `${newLeft}px`;
        });

        // Mouse up event to stop dragging
        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Touch events for mobile
        this.jobSeeker.addEventListener('touchstart', (e) => {
            if (!this.isGameActive) return;
            
            this.isDragging = true;
            const rect = this.jobSeeker.getBoundingClientRect();
            this.dragStartPos = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
            };
            
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            const gameArea = document.querySelector('.game-area');
            const gameRect = gameArea.getBoundingClientRect();
            let newLeft = e.touches[0].clientX - gameRect.left - this.dragStartPos.x;
            
            // Constrain horizontal movement
            newLeft = Math.max(0, Math.min(newLeft, gameRect.width - this.jobSeeker.offsetWidth));
            
            this.jobSeeker.style.left = `${newLeft}px`;
            e.preventDefault();
        });

        document.addEventListener('touchend', () => {
            this.isDragging = false;
        });
    }

    startJobSpawning() {
        if (this.jobInterval) {
            clearInterval(this.jobInterval);
        }
        
        // Spawn first job immediately
        this.spawnJob();
        
        this.jobInterval = setInterval(() => {
            if (this.isGameActive) {
                this.spawnJob();
            }
        }, 2000);
    }

    spawnJob() {
        const jobOffer = document.createElement('div');
        jobOffer.className = 'job-offer falling';
        
        // Random job type
        const job = this.jobTypes[Math.floor(Math.random() * this.jobTypes.length)];
        
        jobOffer.innerHTML = `
            <img src="${job.img}" alt="${job.title}" style="width: 100%; height: 100%; object-fit: contain;">
        `;
        
        // Random position across the width of the game area
        const gameArea = document.querySelector('.game-area');
        const gameWidth = gameArea.offsetWidth;
        const randomX = Math.random() * (gameWidth - 60); // 60px is job offer width
        
        jobOffer.style.left = `${randomX}px`;
        jobOffer.style.top = '-60px'; // Start above the game area
        this.gameSpace.appendChild(jobOffer);

        // Check for collision with basket
        const checkCollision = setInterval(() => {
            if (!this.isGameActive) {
                clearInterval(checkCollision);
                return;
            }

            const jobRect = jobOffer.getBoundingClientRect();
            const seekerRect = this.jobSeeker.getBoundingClientRect();

            if (this.isColliding(jobRect, seekerRect)) {
                clearInterval(checkCollision);
                this.collectJob(jobOffer, job);
            }
        }, 50);

        // Remove job offer when animation ends if not collected
        jobOffer.addEventListener('animationend', () => {
            clearInterval(checkCollision);
            if (jobOffer.parentNode) {
                jobOffer.remove();
            }
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    collectJob(jobOffer, job) {
        // Remove the falling job offer
        jobOffer.remove();

        // Add to collected jobs
        const collectedContainer = document.querySelector('.collected-jobs');
        const collectedJob = document.createElement('div');
        collectedJob.className = 'collected-job';
        collectedJob.innerHTML = `<img src="${job.img}" alt="${job.title}" style="width: 100%; height: 100%; object-fit: contain;">`;
        collectedContainer.appendChild(collectedJob);

        // Update count
        this.jobsCollected++;
        document.getElementById('jobCount').textContent = this.jobsCollected;

        // Check for completion
        if (this.jobsCollected >= 3) {
            this.completeLevel();
        }
    }

    completeLevel() {
        this.isGameActive = false;
        clearInterval(this.jobInterval);

        // Save progress before showing overlay
        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        if (!completedLevels.includes(3)) {
            completedLevels.push(3);
            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
        }

        // Show victory overlay with animation
        const overlay = document.getElementById('victoryOverlay');
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        
        // Add a small delay for the fade-in animation
        setTimeout(() => {
            overlay.style.opacity = '1';
            overlay.classList.add('visible');
        }, 10);

        // Update progress if tracker is available
        if (window.progressTracker) {
            window.progressTracker.updateProgress(3);
            window.progressTracker.saveProgress();
        }
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Level3();
});