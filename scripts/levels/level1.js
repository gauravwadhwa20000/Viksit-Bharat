class Level1 {
    constructor(container) {
        this.container = container;
        this.dronesDestroyed = 0;
        this.drones = [];
        this.projectiles = [];
        this.monuments = [];
        this.onComplete = null;
        this.isGameActive = false;
        this.chakraX = 0.5; // 0 (left) to 1 (right), percent of width
        this.chakraWidth = 60;
        this.lastDroneSpawn = Date.now();
        this.gameArea = container;
        this.movementSpeed = 20; // pixels per movement
    }

    preloadImages() {
        const images = [
            'assets/india-gate.png',
            'assets/taj-mahal.png',
            'assets/red-fort.png',
            'assets/sudarshan-chakra.svg',
            'assets/drone.svg'
        ];
        
        return Promise.all(images.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => {
                    console.error(`Failed to load image: ${src}`);
                    resolve(); // Resolve anyway to not block the game
                };
                img.src = src;
            });
        }));
    }

    start() {
        this.gameArea = document.querySelector('.game-area');
        this.isGameActive = false; // Start inactive until images are loaded
        this.dronesDestroyed = 0;
        document.getElementById('droneCount').textContent = this.dronesDestroyed;
        this.chakraX = 0.5;
        this.projectiles = [];
        this.drones = [];
        this.droneSpawnInterval = 3000; // Time between drone spawns in milliseconds
        this.droneSpeed = 1; // Pixels per frame
        
        // Show loading state
        const loadingEl = document.createElement('div');
        loadingEl.style.position = 'absolute';
        loadingEl.style.top = '50%';
        loadingEl.style.left = '50%';
        loadingEl.style.transform = 'translate(-50%, -50%)';
        loadingEl.style.color = '#fff';
        loadingEl.style.fontSize = '20px';
        loadingEl.textContent = 'Loading...';
        this.gameArea.appendChild(loadingEl);

        // Preload images then start game
        this.preloadImages().then(() => {
            this.gameArea.removeChild(loadingEl);
            this.isGameActive = true;
            this.setupEventListeners();
            this.startGameLoop();
            this.updateChakraPosition();
            console.log('Game started with preloaded images');
        });
    }

    setupEventListeners() {
        // Mouse down event to start dragging
        this.chakraElement.addEventListener('mousedown', (e) => {
            if (!this.isGameActive) return;
            
            this.isDragging = true;
            this.dragStartPos = {
                x: e.clientX - this.chakraElement.offsetLeft,
                y: e.clientY - this.chakraElement.offsetTop
            };
            
            // Start rotation while dragging
            this.chakraElement.querySelector('.chakra').style.transform = 'rotate(0deg)';
            
            e.preventDefault();
        });

        // Mouse move event for dragging
        document.addEventListener('mousemove', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            const gameRect = this.gameArea.getBoundingClientRect();
            let newLeft = e.clientX - this.dragStartPos.x;
            
            // Constrain horizontal movement
            newLeft = Math.max(0, Math.min(newLeft, gameRect.width - this.chakraElement.offsetWidth));
            
            this.chakraElement.style.left = `${newLeft}px`;
            this.chakraElement.style.transform = 'translate(0, 0)';
            
            // Rotate while dragging
            const rotation = (newLeft / gameRect.width) * 720;
            this.chakraElement.querySelector('.chakra').style.transform = `rotate(${rotation}deg)`;
        });

        // Mouse up event to launch
        document.addEventListener('mouseup', (e) => {
            if (!this.isDragging || !this.isGameActive) return;
            
            this.isDragging = false;
            this.launchChakra();
        });
    }

    updateChakraPosition() {
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        const chakra = document.getElementById('chakraLauncher');
        const left = (this.chakraX * (gameAreaRect.width - this.chakraWidth));
        chakra.style.left = `${left}px`;
        chakra.style.transform = 'none'; // Remove the default transform
    }

    startGameLoop() {
        let lastTime = 0;
        const animate = (timestamp) => {
            if (!this.isGameActive) return;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;
            this.update(deltaTime);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    update(deltaTime) {
        if (!this.isGameActive) return;

        // Spawn drones
        const now = Date.now();
        if (now - this.lastDroneSpawn > this.droneSpawnInterval) {
            this.spawnDrone();
            this.lastDroneSpawn = now;
            console.log('Spawning new drone');
        }

        // Move drones
        for (let i = this.drones.length - 1; i >= 0; i--) {
            const drone = this.drones[i];
            drone.y += this.droneSpeed;
            drone.element.style.top = `${drone.y}px`;
            drone.element.style.transform = `rotate(${Math.sin(now * 0.002 + i) * 10}deg)`; // Add wobble effect

            // Check collision with monuments
            if (drone.y + drone.height >= this.gameArea.offsetHeight - 150) {
                // Find the closest monument to the drone
                const monuments = document.querySelectorAll('.monument');
                const droneX = drone.x + (drone.width / 2);
                let closestMonument = null;
                let minDistance = Infinity;
                
                monuments.forEach(monument => {
                    const monumentRect = monument.getBoundingClientRect();
                    const monumentX = monumentRect.left + (monumentRect.width / 2);
                    const distance = Math.abs(droneX - monumentX);
                    
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestMonument = monument;
                    }
                });

                // Add damage effect to the closest monument
                if (closestMonument) {
                    closestMonument.classList.add('damaged');
                    // Add shake animation
                    closestMonument.style.animation = 'shake 0.5s ease-in-out';
                    setTimeout(() => {
                        closestMonument.style.animation = '';
                    }, 500);
                }

                drone.element.remove();
                this.drones.splice(i, 1);
                console.log('Drone reached bottom and damaged monument');
            }
        }

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.y -= 7; // Faster projectile speed
            proj.element.style.top = `${proj.y}px`;

            // Remove projectile if it goes off screen
            if (proj.y < 0) {
                proj.element.remove();
                this.projectiles.splice(i, 1);
                continue;
            }

            // Check collisions with drones
            for (let j = this.drones.length - 1; j >= 0; j--) {
                const drone = this.drones[j];
                if (this.isColliding(proj, drone)) {
                    // Add explosion effect
                    this.createExplosion(drone.x, drone.y);
                    
                    drone.element.remove();
                    proj.element.remove();
                    this.drones.splice(j, 1);
                    this.projectiles.splice(i, 1);
                    this.dronesDestroyed++;
                    document.getElementById('droneCount').textContent = this.dronesDestroyed;
                    
                    if (this.dronesDestroyed >= 3) {
                        this.completeLevel();
                    }
                    break;
                }
            }
        }
    }

    createExplosion(x, y) {
        const explosion = document.createElement('div');
        explosion.style.position = 'absolute';
        explosion.style.left = `${x}px`;
        explosion.style.top = `${y}px`;
        explosion.style.width = '60px';
        explosion.style.height = '60px';
        explosion.style.backgroundColor = 'rgba(255, 165, 0, 0.6)';
        explosion.style.borderRadius = '50%';
        explosion.style.animation = 'explode 0.5s forwards';
        this.gameArea.appendChild(explosion);

        setTimeout(() => {
            explosion.remove();
        }, 500);
    }

    spawnDrone() {
        const droneEl = document.createElement('div');
        droneEl.className = 'drone';
        droneEl.style.position = 'absolute';
        droneEl.style.width = '40px';
        droneEl.style.height = '40px';
        
        // Calculate random position but avoid spawning directly above monuments
        const gameWidth = this.gameArea.offsetWidth;
        const minX = gameWidth * 0.1;
        const maxX = gameWidth * 0.9;
        const x = Math.floor(minX + (Math.random() * (maxX - minX)));
        
        droneEl.style.left = `${x}px`;
        droneEl.style.top = '-40px';
        droneEl.style.zIndex = '1';
        this.gameArea.appendChild(droneEl);
        
        const drone = {
            element: droneEl,
            x: x,
            y: -40,
            width: 40,
            height: 40
        };
        
        this.drones.push(drone);
        console.log('Drone spawned:', drone); // Debug log
    }

    launchChakra() {
        const chakra = document.getElementById('chakraLauncher');
        const chakraRect = chakra.getBoundingClientRect();
        const gameAreaRect = this.gameArea.getBoundingClientRect();
        
        // Get the actual position of the chakra launcher
        const left = parseFloat(chakra.style.left);
        
        // Create projectile element
        const projEl = document.createElement('div');
        projEl.className = 'chakra-projectile';
        projEl.style.position = 'absolute';
        projEl.style.width = '30px';
        projEl.style.height = '30px';
        projEl.style.left = (left + 10) + 'px';
        projEl.style.bottom = '160px';
        projEl.style.animation = 'spin 1s linear infinite, launch 0.1s ease-out';
        this.gameArea.appendChild(projEl);

        // Add visual feedback for launch
        const flashEffect = document.createElement('div');
        flashEffect.className = 'launch-flash';
        flashEffect.style.left = (left + 10) + 'px';
        flashEffect.style.bottom = '160px';
        this.gameArea.appendChild(flashEffect);
        setTimeout(() => flashEffect.remove(), 200);
        
        this.projectiles.push({
            element: projEl,
            x: left + 10,
            y: this.gameArea.offsetHeight - 160,
            width: 30,
            height: 30
        });
    }

    isColliding(a, b) {
        // Add some tolerance to make hits easier
        const tolerance = 10;
        return (
            (a.x + tolerance) < (b.x + b.width) &&
            (a.x + a.width - tolerance) > b.x &&
            (a.y + tolerance) < (b.y + b.height) &&
            (a.y + a.height - tolerance) > b.y
        );
    }

    completeLevel() {
        this.isGameActive = false;
        // Update progress
        updateProgress(1, true); // Mark level 1 as complete
        // Navigate to next level
        window.location.href = 'game.html';
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new Level1(document.querySelector('.game-area'));
    game.start();
    
    // Debug log to verify initialization
    console.log('Game initialized');
});