
//1. sound library and state
const soundFiles = {
    'rain': './assets/sounds/rain.mp3',
    'brown-noise': './assets/sounds/brown-noise.mp3'
};

let currentAudio = null;
let currentSoundKey = null;
let isPlaying = false;

//dom elements
const soundButtons = document.querySelectorAll('.sound-btn');
const volumeSlider = document.getElementById('volume-slider');
const musicToggleBtn = document.getElementById('music-toggle-btn');


//helper functions
function updateMusicUI() {
    if (musicToggleBtn) {
        musicToggleBtn.textContent = isPlaying ? '🎵' : '🔇';
    }

    // Highlight only the button of the sound that is currently playing
    soundButtons.forEach(btn => {
        const isCurrentAndPlaying = btn.dataset.sound === currentSoundKey && isPlaying;
        btn.classList.toggle('active-sound', isCurrentAndPlaying);
    });
}

// If another sound is already loaded, stop and rewind it first
function playNewSound(soundKey) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    // Create a new HTML5 Audio instance
    const filePath = soundFiles[soundKey];
    currentAudio = new Audio(filePath);
    currentAudio.loop = true;

    if (volumeSlider) {
        currentAudio.volume = volumeSlider.value / 100;
    }

    currentAudio.play().catch(error => {
        console.warn('Could not play audio. Check if the .mp3 file exists:', error);
    });

    currentSoundKey = soundKey;
    isPlaying = true;
    updateMusicUI();
}

//event listeners

// Ready sound buttons (Rain, Brown noise)
soundButtons.forEach(button => {
    button.addEventListener('click', function () {
        const selectedSound = this.dataset.sound;

        // Case 1: User clicked the SAME sound that is already loaded
        if (selectedSound === currentSoundKey && currentAudio) {
            if (isPlaying) {
                currentAudio.pause();
                isPlaying = false;
            } else {
                currentAudio.play();
                isPlaying = true;
            }
            updateMusicUI();
            return;
        }

        // Case 2: User clicked a NEW sound
        playNewSound(selectedSound);
    });
});

// Music icon button (🎵) as global Play/Pause
if (musicToggleBtn) {
    musicToggleBtn.addEventListener ('click', function(){
        // If no sound has been selected yet, start the first one (Rain)
        if (!currentAudio) {
            playNewSound('rain');
            return;
        }

        if (isPlaying) {
            currentAudio.pause();
            isPlaying = false;
        } else {
            currentAudio.play();
            isPlaying = true;
        }

        updateMusicUI();
    });
}

//volume slider
if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
        if (currentAudio) {
            currentAudio.volume = this.value / 100;
        }
    });
}