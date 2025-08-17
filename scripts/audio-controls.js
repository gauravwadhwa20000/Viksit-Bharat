// Audio Controls
document.addEventListener('DOMContentLoaded', () => {
    // Set initial audio state to off if not set
    if (!localStorage.getItem('audioEnabled')) {
        localStorage.setItem('audioEnabled', 'false');
    }
    const bgMusic = document.getElementById('bgMusic');
    const toggleSound = document.getElementById('toggleSound');
    const soundIcon = document.getElementById('soundIcon');

    // Get the stored audio state
    const getStoredAudioState = () => {
        return localStorage.getItem('audioEnabled') === 'true';
    };

    // Set the stored audio state
    const setStoredAudioState = (isEnabled) => {
        localStorage.setItem('audioEnabled', isEnabled);
    };

    // Update UI based on audio state
    const updateAudioUI = (isPlaying) => {
        soundIcon.src = isPlaying ? 'assets/sound-on.svg' : 'assets/sound-off.svg';
    };

    // Initialize audio state
    const initializeAudio = () => {
        const isEnabled = getStoredAudioState();
        bgMusic.volume = 0.5;
        updateAudioUI(isEnabled);
        
        if (isEnabled) {
            bgMusic.play().catch(error => {
                console.log('Initial audio play prevented:', error);
                setStoredAudioState(false);
                updateAudioUI(false);
            });
        }
    };

    // Toggle sound handler
    const handleToggleSound = async () => {
        const isCurrentlyPlaying = getStoredAudioState();
        
        try {
            if (isCurrentlyPlaying) {
                bgMusic.pause();
                setStoredAudioState(false);
                updateAudioUI(false);
            } else {
                await bgMusic.play();
                setStoredAudioState(true);
                updateAudioUI(true);
            }
        } catch (error) {
            console.error('Audio toggle failed:', error);
            setStoredAudioState(false);
            updateAudioUI(false);
        }
    };

    // Add click handler to toggle button
    toggleSound.addEventListener('click', () => {
        handleToggleSound();
    });

    // Initialize audio when document loads
    initializeAudio();

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        const isEnabled = getStoredAudioState();
        if (document.hidden) {
            bgMusic.pause();
        } else if (isEnabled) {
            bgMusic.play().catch(console.error);
        }
    });
});