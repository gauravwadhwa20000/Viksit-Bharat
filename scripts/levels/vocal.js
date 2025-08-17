// Initialize game when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new VocalForLocal();
});

// Initialize the game when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Track level start
    Analytics.trackLevelStart(2, 'Vocal for Local');
    console.log('Document loaded, initializing game...');
    new VocalForLocal();
});

class VocalForLocal {
    constructor() {
        console.log('VocalForLocal constructor called');
        this.brands = [
            { id: 'boat', type: 'local', image: './assets/boat.png' },
            { id: 'lenskart', type: 'local', image: './assets/lenskart.png' },
            { id: 'patanjali', type: 'local', image: './assets/patanjali.png' },
            { id: 'tata', type: 'local', image: './assets/tata.png' },
            { id: 'pg', type: 'global', image: './assets/P&G.png' },
            { id: 'ms', type: 'global', image: './assets/ms.png' },
            { id: 'toyota', type: 'global', image: './assets/toyota.png' }
        ];
        
        this.correctBrands = 0;
        this.maxBrands = 3;
        this.selectedBrands = new Set();
        this.gameStarted = true;
        this.sounds = {};
        
        this.initializeGame();
    }

    initializeGame() {
        // Initialize sound effects
        this.sounds = {
            correct: document.getElementById('correctSound'),
            wrong: document.getElementById('wrongSound'),
            win: document.getElementById('winSound')
        };

        // Setup UI elements
        this.setupInstructions();
        this.setupHelpButton();
        this.shuffleBrands();
        this.createBrandIcons();
        this.setupDragAndDrop();
        this.updateScore();
    }

    setupInstructions() {
        const overlay = document.getElementById('instructionsOverlay');
        const startButton = document.getElementById('startGame');
        
        startButton.addEventListener('click', () => {
            overlay.style.display = 'none';
            this.gameStarted = true;
        });
    }

    setupHelpButton() {
        const helpButton = document.getElementById('helpButton');
        const overlay = document.getElementById('instructionsOverlay');
        
        helpButton.addEventListener('click', () => {
            overlay.style.display = 'flex';
        });
    }

    shuffleBrands() {
        for (let i = this.brands.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.brands[i], this.brands[j]] = [this.brands[j], this.brands[i]];
        }
    }

    createBrandIcons() {
        console.log('Creating brand icons...');
        const container = document.querySelector('#brandsGrid');
        if (!container) {
            console.error('Brand grid container not found!');
            return;
        }
        
        container.innerHTML = '';
        
        this.brands.forEach(brand => {
            console.log(`Creating brand: ${brand.id}, image: ${brand.image}`);
            
            const brandElement = document.createElement('div');
            brandElement.className = 'brand-item';
            brandElement.draggable = true;
            brandElement.dataset.id = brand.id;
            brandElement.dataset.type = brand.type;

            const img = document.createElement('img');
            img.src = brand.image;
            img.alt = brand.id;
            img.draggable = false;
            
            // Add error handling for image loading
            img.onerror = () => {
                console.error(`Failed to load image: ${brand.image}`);
                img.style.backgroundColor = '#f0f0f0';
                img.style.padding = '10px';
                img.style.border = '1px solid #ccc';
            };
            
            img.onload = () => {
                console.log(`Successfully loaded image: ${brand.image}`);
            };
            
            brandElement.appendChild(img);
            container.appendChild(brandElement);

            brandElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', brand.id);
                brandElement.classList.add('dragging');
            });

            brandElement.addEventListener('dragend', () => {
                brandElement.classList.remove('dragging');
            });
        });
    }
    }

    setupDragAndDrop() {
        const brandItems = document.querySelectorAll('.brand-item');
        const basket = document.getElementById('localBasket');

        brandItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.id);
                item.classList.add('dragging');
                // Create a clean drag image
                const dragImage = item.cloneNode(true);
                dragImage.style.width = '80px';
                dragImage.style.height = '80px';
                dragImage.style.opacity = '0.8';
                document.body.appendChild(dragImage);
                e.dataTransfer.setDragImage(dragImage, 40, 40);
                setTimeout(() => document.body.removeChild(dragImage), 0);
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            // Add touch support for mobile
            item.addEventListener('touchstart', (e) => {
                item.classList.add('dragging');
            }, { passive: true });

            item.addEventListener('touchend', () => {
                item.classList.remove('dragging');
            });
        });

        basket.addEventListener('dragover', (e) => {
            e.preventDefault();
            basket.classList.add('drag-over');
        });

        basket.addEventListener('dragleave', () => {
            basket.classList.remove('drag-over');
        });

        basket.addEventListener('drop', (e) => {
            e.preventDefault();
            basket.classList.remove('drag-over');
            const brandId = e.dataTransfer.getData('text/plain');
            this.handleDrop(brandId);
        });
    }

    handleDrop(brandId) {
        const brand = this.brands.find(b => b.id === brandId);
        const brandElement = document.querySelector(`[data-id="${brandId}"]`);
        
        if (!brand || this.selectedBrands.has(brandId)) {
            return;
        }

        if (brand.type === 'local') {
            this.sounds.correct.play();
            this.correctBrands++;
            this.selectedBrands.add(brandId);
            this.updateScore();
            
            // Create a clone for the basket
            const clone = brandElement.cloneNode(true);
            clone.classList.add('basket-brand');
            
            // Add to basket with animation
            const basketItems = document.querySelector('.basket-items');
            basketItems.appendChild(clone);
            
            // Show success feedback
            this.showFeedback(`Great choice! ${brand.name} is an Indian brand! 🇮🇳`, "success");
            
            if (this.correctBrands >= this.maxBrands) {
                this.win();
            }
        } else {
            // Wrong brand selected
            this.sounds.wrong.play();
            const basket = document.getElementById('localBasket');
            basket.classList.add('shake');
            setTimeout(() => basket.classList.remove('shake'), 500);
            
            this.showFeedback(`${brand.name} is a global brand. Try finding an Indian one! 🔍`, "error");
        }
    }

    showFeedback(message, type) {
        const feedbackElement = document.getElementById('feedbackMessage');
        const messageText = feedbackElement.querySelector('.message-text');
        
        messageText.textContent = message;
        feedbackElement.className = `feedback-message ${type}`;
        feedbackElement.classList.remove('hidden');
        
        setTimeout(() => {
            feedbackElement.classList.add('hidden');
        }, 2000);
    }

    updateScore() {
        document.getElementById('brandCount').textContent = this.correctBrands;
    }

    win() {
        // Play win sound and add win animation to basket
        this.sounds.win.play();
        const basket = document.getElementById('localBasket');
        basket.classList.add('win');
        
        // Show victory popup with animation
        setTimeout(() => {
            const popup = document.getElementById('victoryPopup');
            popup.style.display = 'flex';
            popup.classList.remove('hidden');
            
            // Add animation to popup content
            const content = popup.querySelector('.popup-content');
            content.style.opacity = '0';
            content.style.transform = 'scale(0.8)';
            
            // Trigger animation after a brief delay
            setTimeout(() => {
                content.style.opacity = '1';
                content.style.transform = 'scale(1)';
            }, 100);
        }, 1000);

        // Setup continue button with one-time event listener
        const nextButton = document.getElementById('nextLevel');
        const handleContinue = () => {
            window.location.href = 'game.html';
            nextButton.removeEventListener('click', handleContinue);
        };
        nextButton.addEventListener('click', handleContinue);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new VocalForLocal();
});