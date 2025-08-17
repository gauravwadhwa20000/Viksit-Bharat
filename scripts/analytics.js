// Google Analytics Configuration and Custom Events
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize GA4
gtag('js', new Date());
gtag('config', 'G-2P1FDKVZ42');

// Custom event tracking functions
const Analytics = {
    // Track level starts
    trackLevelStart: (levelNumber, levelName) => {
        gtag('event', 'level_start', {
            level_number: levelNumber,
            level_name: levelName
        });
    },

    // Track level completions
    trackLevelComplete: (levelNumber, levelName, score) => {
        gtag('event', 'level_complete', {
            level_number: levelNumber,
            level_name: levelName,
            score: score
        });
    },

    // Track interactions (like clicking buttons, dragging items)
    trackInteraction: (interactionType, elementName) => {
        gtag('event', 'game_interaction', {
            interaction_type: interactionType,
            element_name: elementName
        });
    },

    // Track mission progress
    trackMissionProgress: (completedMissions) => {
        gtag('event', 'mission_progress', {
            completed_missions: completedMissions,
            total_missions: 3
        });
    },

    // Track achievement unlocks
    trackAchievement: (achievementName) => {
        gtag('event', 'achievement_unlock', {
            achievement_name: achievementName
        });
    },

    // Track social shares
    trackShare: (platform) => {
        gtag('event', 'game_share', {
            platform: platform
        });
    }
};

// Add this to window for global access
window.Analytics = Analytics;