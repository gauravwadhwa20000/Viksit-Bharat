// Function to detect mobile devices
function isMobileDevice() {
    return (window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

// Function to create and show the desktop mode modal
function showDesktopModePrompt() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 90%;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;

    content.innerHTML = `
        <h2 style="color: #0F52BA; margin: 0 0 15px 0; font-size: 1.5rem;">⚠️ Desktop Mode Recommended</h2>
        <p style="margin: 0 0 20px 0; color: #444; line-height: 1.4;">
            For the best gaming experience, please switch to Desktop Mode in your browser settings.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
            <button id="openDesktop" style="
                background: #0F52BA;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                font-size: 1rem;
                transition: background 0.2s;
            ">Switch to Desktop Mode</button>
            <button id="continueAnyway" style="
                background: transparent;
                color: #666;
                border: 1px solid #ccc;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            ">Continue Anyway</button>
        </div>
        <p style="margin: 20px 0 0 0; font-size: 0.9rem; color: #666;">
            Note: The game is optimized for desktop view.
        </p>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Event listeners for buttons
    document.getElementById('openDesktop').addEventListener('click', () => {
        // Request desktop site (this might not work on all browsers)
        if (document.querySelector('meta[name="viewport"]')) {
            document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1024');
        }
        modal.remove();
    });

    document.getElementById('continueAnyway').addEventListener('click', () => {
        modal.remove();
        localStorage.setItem('skipDesktopCheck', 'true');
    });
}

// Check if user is on mobile and hasn't dismissed the prompt
document.addEventListener('DOMContentLoaded', () => {
    if (isMobileDevice() && !localStorage.getItem('skipDesktopCheck')) {
        showDesktopModePrompt();
    }
});

// Recheck on window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (isMobileDevice() && !localStorage.getItem('skipDesktopCheck')) {
            showDesktopModePrompt();
        }
    }, 250);
});