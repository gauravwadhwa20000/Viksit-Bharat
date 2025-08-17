// Mobile touch handling utilities
const MobileUtils = {
    // Prevent double tap zoom
    preventDoubleTapZoom() {
        let lastTapTime = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 500 && tapLength > 0) {
                e.preventDefault();
            }
            lastTapTime = currentTime;
        });
    },

    // Add touch feedback to interactive elements
    addTouchFeedback() {
        const elements = document.querySelectorAll('button, .clickable, .play-btn, .icon-btn, .continue-button');
        elements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            ['touchend', 'touchcancel'].forEach(event => {
                element.addEventListener(event, () => {
                    element.style.transform = '';
                }, { passive: true });
            });
        });
    },
    // Prevent page bounce on iOS
    preventBounce() {
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('.brands-grid, .victory-content, .modal-content')) {
                return;
            }
            e.preventDefault();
        }, { passive: false });
    },

    // Enable touch dragging
    enableTouchDrag(element, options = {}) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        let transform = {
            x: 0,
            y: 0
        };

        const start = (e) => {
            if (e.type === 'touchstart') {
                startX = e.touches[0].clientX - transform.x;
                startY = e.touches[0].clientY - transform.y;
            } else {
                startX = e.clientX - transform.x;
                startY = e.clientY - transform.y;
            }

            isDragging = true;
            if (options.onStart) options.onStart(e);
        };

        const move = (e) => {
            if (!isDragging) return;

            e.preventDefault();
            let currentX, currentY;

            if (e.type === 'touchmove') {
                currentX = e.touches[0].clientX - startX;
                currentY = e.touches[0].clientY - startY;
            } else {
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
            }

            transform.x = currentX;
            transform.y = currentY;

            if (options.onMove) options.onMove(transform.x, transform.y, e);
        };

        const end = (e) => {
            isDragging = false;
            if (options.onEnd) options.onEnd(e);
        };

        element.addEventListener('touchstart', start, { passive: false });
        element.addEventListener('touchmove', move, { passive: false });
        element.addEventListener('touchend', end);
        element.addEventListener('touchcancel', end);

        // Also add mouse events for hybrid devices
        element.addEventListener('mousedown', start);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', end);

        return {
            destroy() {
                element.removeEventListener('touchstart', start);
                element.removeEventListener('touchmove', move);
                element.removeEventListener('touchend', end);
                element.removeEventListener('touchcancel', end);
                element.removeEventListener('mousedown', start);
                document.removeEventListener('mousemove', move);
                document.removeEventListener('mouseup', end);
            }
        };
    },

    // Handle safe area insets
    setupSafeArea() {
        const root = document.documentElement;
        
        // Update CSS variables with safe area values
        function updateSafeArea() {
            const computedStyle = getComputedStyle(document.documentElement);
            const top = computedStyle.getPropertyValue('--sat') || '0px';
            const right = computedStyle.getPropertyValue('--sar') || '0px';
            const bottom = computedStyle.getPropertyValue('--sab') || '0px';
            const left = computedStyle.getPropertyValue('--sal') || '0px';

            root.style.setProperty('--safe-area-top', top);
            root.style.setProperty('--safe-area-right', right);
            root.style.setProperty('--safe-area-bottom', bottom);
            root.style.setProperty('--safe-area-left', left);
        }

        // Initial update
        updateSafeArea();

        // Update on orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(updateSafeArea, 100);
        });
    },

    // Initialize all mobile optimizations
    init() {
        this.preventBounce();
        this.preventDoubleTapZoom();
        this.addTouchFeedback();
        this.setupSafeArea();

        // Add iOS specific body class
        if (navigator.platform.match(/(iPhone|iPod|iPad)/i)) {
            document.body.classList.add('ios-device');
        }

        // Prevent unwanted touch behaviors
        document.addEventListener('gesturestart', (e) => e.preventDefault());
        document.addEventListener('gesturechange', (e) => e.preventDefault());
        document.addEventListener('gestureend', (e) => e.preventDefault());

        // Handle visibility change for better resource management
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause game animations or sounds if needed
            } else {
                // Resume game
            }
        });
    }
};

// Initialize mobile utilities when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MobileUtils.init();
});