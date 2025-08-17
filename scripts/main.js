document.addEventListener('DOMContentLoaded', () => {
    // Audio Controls
    const bgMusic = document.getElementById('bgMusic');
    const toggleSound = document.getElementById('toggleSound');
    const soundIcon = document.getElementById('soundIcon');
    let isMusicPlaying = false;

    // Function to initialize audio
    const initAudio = () => {
        bgMusic.volume = 0.5;
        bgMusic.load();
        
        // Log audio element status
        console.log('Audio element loaded:', {
            src: bgMusic.currentSrc,
            ready: bgMusic.readyState,
            error: bgMusic.error
        });
    };

    // Handle sound toggle click with improved error handling
    toggleSound.addEventListener('click', async () => {
        try {
            if (isMusicPlaying) {
                bgMusic.pause();
                soundIcon.src = 'assets/sound-off.svg';
                isMusicPlaying = false;
            } else {
                // Make sure audio is loaded
                if (bgMusic.readyState < 4) {
                    bgMusic.load();
                }
                
                const playPromise = bgMusic.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            soundIcon.src = 'assets/sound-on.svg';
                            isMusicPlaying = true;
                            console.log('Audio playing successfully');
                        })
                        .catch(error => {
                            console.error('Audio play failed:', error);
                            soundIcon.src = 'assets/sound-off.svg';
                            isMusicPlaying = false;
                        });
                }
            }
        } catch (error) {
            console.error('Audio toggle failed:', error);
            soundIcon.src = 'assets/sound-off.svg';
            isMusicPlaying = false;
        }
    });

    // Initialize audio when page loads
    initAudio();

    // Add error handling for audio loading
    bgMusic.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
    });

    // Log when audio is actually ready
    bgMusic.addEventListener('canplaythrough', () => {
        console.log('Audio is ready to play');
    });

    // Start Mission Button
    const startMissionBtn = document.getElementById('startMissionBtn');
    startMissionBtn.addEventListener('click', () => {
        window.location.href = 'game.html';
    });
});