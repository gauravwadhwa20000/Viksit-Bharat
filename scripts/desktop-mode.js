// Mobile detection and handling
document.addEventListener('DOMContentLoaded', function() {
    // Add a desktop mode toggle button for mobile users
    if (window.innerWidth <= 768) {
        const desktopModeBtn = document.createElement('button');
        desktopModeBtn.className = 'desktop-mode-btn';
        desktopModeBtn.textContent = 'Switch to Desktop Mode';
        desktopModeBtn.style.cssText = `
            position: fixed;
            bottom: ${document.querySelector('.all-missions-button') ? '70px' : '20px'};
            left: 50%;
            transform: translateX(-50%);
            background: #fff;
            color: #0066CC;
            border: 1px solid #0066CC;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            display: none;
        `;

        // Add button to page
        document.body.appendChild(desktopModeBtn);

        // Show button if user is having scroll issues
        let scrollAttempts = 0;
        document.addEventListener('touchmove', function(e) {
            if (e.touches.length === 1) {
                scrollAttempts++;
                if (scrollAttempts > 3) {
                    desktopModeBtn.style.display = 'block';
                }
            }
        });

        // Handle desktop mode switch
        desktopModeBtn.addEventListener('click', function() {
            // Remove mobile-specific styles
            document.body.classList.remove('mobile-body');
            document.querySelector('.mobile-container').classList.remove('mobile-container');
            
            // Add desktop mode meta tag
            const viewport = document.querySelector('meta[name="viewport"]');
            viewport.setAttribute('content', 'width=1024');

            // Hide the button
            desktopModeBtn.style.display = 'none';

            // Store preference
            localStorage.setItem('preferDesktopMode', 'true');
        });

        // Check for stored preference
        if (localStorage.getItem('preferDesktopMode') === 'true') {
            desktopModeBtn.click();
        }
    }
});