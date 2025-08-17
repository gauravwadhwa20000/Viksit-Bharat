// Track overall game progress and completion
document.addEventListener('DOMContentLoaded', function() {
    const completedLevels = JSON.parse(localStorage.getItem('completedLevels') || '[]');
    
    // Track initial progress
    Analytics.trackMissionProgress(completedLevels.length);

    // Track level selection
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const levelNum = btn.dataset.level;
            const levelName = btn.closest('.level-block').querySelector('h3').textContent;
            Analytics.trackInteraction('level_selection', levelName);
        });
    });

    // Track sound toggle
    document.getElementById('toggleSound')?.addEventListener('click', () => {
        Analytics.trackInteraction('sound_toggle', document.getElementById('soundIcon').src.includes('on') ? 'off' : 'on');
    });

    // Track achievement sharing
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const platform = btn.className.split(' ')[1]; // twitter, linkedin, or whatsapp
            Analytics.trackShare(platform);
        });
    });

    // Track achievement downloads
    document.querySelector('.download-btn')?.addEventListener('click', () => {
        Analytics.trackInteraction('achievement_download', 'Changemaker Badge');
    });

    // Track game completion
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const congratsModal = document.getElementById('congratsModal');
                if (congratsModal && getComputedStyle(congratsModal).display !== 'none') {
                    Analytics.trackAchievement('Game Complete - All Missions');
                }
            }
        });
    });

    const congratsModal = document.getElementById('congratsModal');
    if (congratsModal) {
        observer.observe(congratsModal, { attributes: true });
    }
});