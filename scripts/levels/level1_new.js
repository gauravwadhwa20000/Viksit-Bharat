class Level1 {
    constructor(container) {
        this.container = container;
        this.dronesDestroyed = 0;
        this.drones = [];
        this.isGameActive = false;
        this.chakraElement = null;
        this.isDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.droneInterval = null;
        this.isTouchDevice = 'ontouchstart' in window;
    }

    start() {
        this.gameArea = document.querySelector('.game-area');
        this.chakraElement = document.getElementById('chakraLauncher');
        this.isGameActive = true;
        this.dronesDestroyed = 0;
        document.getElementById('droneCount').textContent = '0';
        
        this.setupEventListeners();
        this.startDroneSpawning();

        // Prevent scrolling on touch devices
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
    }

    setupEventListeners() {
        // Touch Events
        this.chakraElement.addEventListener('touchstart', (e) => {
            if (!this.isGameActive) return;
            
            this.isDragging = true;
            const touch = e.touches[0];
            const rect = this.chakraElement.getBoundingClientRect();
            this.dragStartPos = {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
            
            this.chakraElement.querySelector('.chakra').style.transform = 'rotate(0deg)';
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            const touch = e.touches[0];
            const gameRect = this.gameArea.getBoundingClientRect();
            let newLeft = touch.clientX - gameRect.left - this.dragStartPos.x;
            
            newLeft = Math.max(0, Math.min(newLeft, gameRect.width - 50));
            this.chakraElement.style.left = `${newLeft}px`;
            
            const rotation = (newLeft / gameRect.width) * 720;
            this.chakraElement.querySelector('.chakra').style.transform = `rotate(${rotation}deg)`;
            
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            this.isDragging = false;
            this.launchChakra();
            e.preventDefault();
        }, { passive: false });

        // Mouse Events (keep existing mouse support)
        this.chakraElement.addEventListener('mousedown', (e) => {
            if (!this.isGameActive || this.isTouchDevice) return;
            
            this.isDragging = true;
            const rect = this.chakraElement.getBoundingClientRect();
            this.dragStartPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            this.chakraElement.querySelector('.chakra').style.transform = 'rotate(0deg)';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.isGameActive || this.isTouchDevice) return;
            
            const gameRect = this.gameArea.getBoundingClientRect();
            let newLeft = e.clientX - gameRect.left - this.dragStartPos.x;
            
            newLeft = Math.max(0, Math.min(newLeft, gameRect.width - 50));
            this.chakraElement.style.left = `${newLeft}px`;
            
            const rotation = (newLeft / gameRect.width) * 720;
            this.chakraElement.querySelector('.chakra').style.transform = `rotate(${rotation}deg)`;
        });

        document.addEventListener('mouseup', (e) => {
            if (!this.isDragging || !this.isGameActive || this.isTouchDevice) return;
            
            this.isDragging = false;
            this.launchChakra();
        });
    }

    startDroneSpawning() {
        // Clear any existing interval
        if (this.droneInterval) {
            clearInterval(this.droneInterval);
        }
        
        // Start spawning drones
        this.droneInterval = setInterval(() => {
            if (this.isGameActive) {
                // Keep max 3 drones on screen at a time
                if (this.drones.length < 3) {
                    this.spawnDrone();
                }
            }
        }, 1500); // Spawn slightly faster
    }

    spawnDrone() {
        const droneEl = document.createElement('div');
        droneEl.className = 'drone falling';
        
        // Random position across the width of the game area
        const gameWidth = this.gameArea.offsetWidth;
        const randomX = Math.random() * (gameWidth - 50);
        
        droneEl.style.left = `${randomX}px`;
        this.gameArea.appendChild(droneEl);

        const drone = {
            element: droneEl,
            x: randomX,
            y: -50,
            width: 50,
            height: 50
        };
        
        this.drones.push(drone);

        // Check for collision with Chakra during fall
        const checkChakraCollision = setInterval(() => {
            if (!this.drones.includes(drone) || !this.isGameActive) {
                clearInterval(checkChakraCollision);
                return;
            }

            const droneRect = droneEl.getBoundingClientRect();
            const chakraRect = this.chakraElement.getBoundingClientRect();

            if (this.isColliding(droneRect, chakraRect)) {
                // Create explosion effect
                this.createExplosion(droneRect.left, droneRect.top);
                
                // Remove drone and increment score
                this.drones = this.drones.filter(d => d !== drone);
                drone.element.remove();
                this.dronesDestroyed++;
                document.getElementById('droneCount').textContent = this.dronesDestroyed;
                
                clearInterval(checkChakraCollision);

                if (this.dronesDestroyed === 5) {
                    this.isGameActive = false;
                    clearInterval(this.droneInterval);
                    
                    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
                    if (!completedLevels.includes(1)) {
                        completedLevels.push(1);
                        localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                    }
                    
                    setTimeout(() => {
                        this.completeLevel();
                    }, 800);
                }
            }
        }, 50);

        // Remove drone when animation ends if not destroyed
        droneEl.addEventListener('animationend', () => {
            if (this.drones.includes(drone)) {
                this.drones = this.drones.filter(d => d !== drone);
                droneEl.remove();
                clearInterval(checkChakraCollision);
                // Spawn a new drone if the level is still active
                if (this.isGameActive && this.dronesDestroyed < 5) {
                    setTimeout(() => this.spawnDrone(), Math.random() * 1000);
                }
            }
        });
    }

    launchChakra() {
        const chakraPos = this.chakraElement.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        
        // Create projectile effect
        const clone = this.chakraElement.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = this.chakraElement.style.left;
        clone.style.bottom = '160px';
        clone.style.transition = 'all 1s linear';
        clone.style.zIndex = '3';
        clone.style.opacity = '1';
        
        // Ensure image is loaded in clone
        const cloneImg = clone.querySelector('.chakra');
        cloneImg.style.width = '100%';
        cloneImg.style.height = '100%';
        cloneImg.style.display = 'block';
        
        this.gameArea.appendChild(clone);

        // Animate upward
        requestAnimationFrame(() => {
            clone.style.transform = `translateY(-${gameRect.height + 100}px) rotate(720deg)`;
        });

        // Check for collisions while moving up
        const checkCollision = setInterval(() => {
            const projectileRect = clone.getBoundingClientRect();
            
            this.drones.forEach(drone => {
                const droneRect = drone.element.getBoundingClientRect();
                
                if (this.isColliding(projectileRect, droneRect)) {
                    // Create explosion effect
                    this.createExplosion(droneRect.left, droneRect.top);
                    
                    // Remove drone and increment score
                    this.drones = this.drones.filter(d => d !== drone);
                    drone.element.remove();
                    this.dronesDestroyed++;
                    document.getElementById('droneCount').textContent = this.dronesDestroyed;
                    
                    // Clear collision checking
                    clearInterval(checkCollision);
                    clone.remove();
                    
                    if (this.dronesDestroyed === 5) {
                        // Immediately stop game activity
                        this.isGameActive = false;
                        clearInterval(this.droneInterval);
                        
                        // Save completion status immediately
                        const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
                        if (!completedLevels.includes(1)) {
                            completedLevels.push(1);
                            localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
                        }
                        
                        // Let the explosion animation play
                        setTimeout(() => {
                            // Clear all remaining drones
                            this.drones.forEach(drone => {
                                if (drone.element && drone.element.parentNode) {
                                    drone.element.remove();
                                }
                            });
                            this.drones = [];
                            
                            // Show completion screen
                            this.completeLevel();
                        }, 800); // Wait for explosion animation
                    }
                }
            });
        }, 50);

        // Remove projectile after animation
        setTimeout(() => {
            clearInterval(checkCollision);
            if (clone.parentNode) {
                clone.remove();
            }
        }, 1000);
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        this.gameArea.appendChild(explosion);

        explosion.addEventListener('animationend', () => {
            explosion.remove();
        });
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    completeLevel() {
        // Stop the game completely
        this.isGameActive = false;
        clearInterval(this.droneInterval);
        
        // Double check completion status is saved
        let levels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
        if (!levels.includes(1)) {
            levels.push(1);
            localStorage.setItem('completedLevels', JSON.stringify(levels));
        }

        // Show victory overlay with full screen coverage
        const victoryOverlay = document.getElementById('victoryPopup');
        if (victoryOverlay) {
            victoryOverlay.style.display = 'flex';
            victoryOverlay.style.opacity = '1';
            
            // Add click handler to continue button if not already added
            const continueBtn = victoryOverlay.querySelector('#continueBtn');
            if (continueBtn && !continueBtn.hasClickListener) {
                continueBtn.hasClickListener = true;
                continueBtn.addEventListener('click', () => {
                    window.location.href = 'game.html';
                });
            }
        }
        
        // Create and show victory overlay directly in the game area
        const gameArea = document.querySelector('.game-area');
        
        // Create victory overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.5s ease-out;
        `;

        // Create content container
        const content = document.createElement('div');
        content.style.cssText = `
            background: white;
            padding: 1.75rem;
            border-radius: 20px;
            text-align: center;
            max-width: 95%;
            width: 450px;
            animation: slideIn 0.5s ease-out;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            max-height: 90vh;
            overflow-y: auto;
        `;

        // Add content
        content.innerHTML = `
            <div style="margin-bottom: 1.25rem;">
                <img src="assets/completed.svg" alt="Victory Badge" style="width: 70px; height: 70px; margin-bottom: 0.75rem;">
                <h2 style="color: #0F52BA; font-size: 1.75rem; margin-bottom: 0.5rem;">Congratulations! 🎉</h2>
                <p style="color: #333; font-size: 1.1rem; margin-bottom: 0.5rem;">You earned the "Heritage Guardian" Badge</p>
                <p style="color: #666;">Successfully protected India's iconic monuments!</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 1.25rem; border-radius: 12px; text-align: left; margin-bottom: 1.25rem;">
                <h3 style="color: #0F52BA; margin-bottom: 0.75rem; font-size: 1.2rem;">Did you know?</h3>
                <p style="color: #444; line-height: 1.5; margin-bottom: 0.75rem; font-size: 0.95rem;">
                    India is enhancing security measures at heritage sites with advanced drone surveillance 
                    systems and AI-powered protection mechanisms.
                </p>
                <a href="https://timesofindia.indiatimes.com/india/sudarshan-chakra-mission-india-to-develop-powerful-weapon-system-all-you-need-to-know-about-rashtriya-suraksha-kavach/articleshow/123316575.cms" 
                   target="_blank" 
                   style="color: #0F52BA; text-decoration: none; display: block; margin-top: 0.5rem; font-weight: 500; font-size: 0.95rem;">
                   Read More: Mission Sudarshan Chakra - Rashtriya Suraksha Kavach →
                </a>
            </div>
            
            <button id="continueBtn" style="
                background: #FF9933;
                color: white;
                border: none;
                padding: 1rem 2.5rem;
                font-size: 1.2rem;
                border-radius: 30px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: 600;
            ">Continue</button>
        `;

        // Add styles
        const styles = document.createElement('style');
        styles.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from { 
                    opacity: 0;
                    transform: translateY(20px);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            #continueBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(255, 153, 51, 0.4);
            }
        `;
        
        document.head.appendChild(styles);
        overlay.appendChild(content);
        gameArea.appendChild(overlay);

        // Add continue button handler
        const continueBtn = content.querySelector('#continueBtn');
        continueBtn.addEventListener('click', () => {
            // Save progress
            const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
            if (!completedLevels.includes(1)) {
                completedLevels.push(1);
                localStorage.setItem('completedLevels', JSON.stringify(completedLevels));
            }
            
            // Update mission progress
            if (window.progressTracker) {
                window.progressTracker.updateProgress(1);
            }

            // Add fade out animation
            overlay.style.animation = 'fadeOut 0.3s ease-out';
            content.style.animation = 'slideOut 0.3s ease-out';
            
            // Add fadeOut keyframe
            const fadeOutStyle = document.createElement('style');
            fadeOutStyle.textContent = `
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideOut {
                    from { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                    to { 
                        opacity: 0;
                        transform: translateY(20px);
                    }
                }
            `;
            document.head.appendChild(fadeOutStyle);

            // Redirect after animation
            setTimeout(() => {
                window.location.href = 'game.html';
            }, 300);
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Level1(document.querySelector('.game-area'));
    game.start();
});