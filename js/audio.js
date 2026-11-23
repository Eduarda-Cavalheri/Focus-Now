
//1. sound library and state
const soundFiles = {
    'rain': './assets/sounds/rain.mp3',
    'brown-noise': './assets/sounds/brown-noise.mp3'
};

const CROSSFADE_SECONDS = 2;

let currentAudio = null;
let nextAudio = null;
let fadeInterval = null;
let isCrossfading = false;
let currentSoundKey = null;
let isPlaying = false;

//dom elements
const soundButtons = document.querySelectorAll('.sound-btn');
const volumeSlider = document.getElementById('volume-slider');
const musicToggleBtn = document.getElementById('music-toggle-btn');
let masterVolume = volumeSlider ? volumeSlider.value / 100 : 0.5;


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

function stopAllAudio() {
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }

    if (nextAudio) {
        nextAudio.pause();
        nextAudio.currentTime = 0;
        nextAudio = null;
    }

    isCrossfading = false;
}

function pauseCurrentAudio() {
    // If paused mid-crossfade, cleanly cancel the transition
    if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
    }

    if (nextAudio) {
        nextAudio.pause();
        nextAudio = null;
    }

    isCrossfading = false;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.volume = masterVolume;
    }

    isPlaying = false;
    updateMusicUI();
}

// SEAMLESS CROSSFADE ENGINE
function attachLoopListener(audioElement) {
    audioElement.addEventListener('timeupdate', function(){
        if (!isPlaying || isCrossfading || !audioElement.duration) return;
        
        const timeRemaining = audioElement.duration - audioElement.currentTime;

        if (timeRemaining <= CROSSFADE_SECONDS) {
            startCrossfade();
        }
    });
}

function startCrossfade(){
    isCrossfading = true;

    const oldAudio = currentAudio;
    nextAudio = new Audio(soundFiles[currentSoundKey]);
    nextAudio.volume = 0; //Starts silent

    nextAudio.play().catch(error => {
        console.warn('Could not play next loop audio', error);
    });

    // Divide the 2-second fade into 40 tiny steps (50ms each) for smoothness
    const totalSteps = 40;
    const stepDurationMs = (CROSSFADE_SECONDS * 1000) / totalSteps;
    let currentStep = 0;

    fadeInterval = setInterval(function(){
        currentStep++;
        const progress = currentStep / totalSteps; // Goes from 0.025 up to 1.0

        // Fade out old audio, fade in new audio simultaneously
        oldAudio.volume = Math.max(0, masterVolume * (1 - progress));
        nextAudio.volume = Math.min(masterVolume, masterVolume * progress);

        // Transition finished: swap roles
        if (currentStep >= totalSteps) {
            clearInterval(fadeInterval);
            fadeInterval = null;

            oldAudio.pause();
            oldAudio.currentTime = 0;

            currentAudio = nextAudio;
            nextAudio = null;
            isCrossfading = false;

            // Watch the new audio so it also crossfades when its end approaches
            attachLoopListener(currentAudio);
        }
    }, stepDurationMs);
}

// If another sound is already loaded, stop and rewind it first
function playNewSound(soundKey) {
    stopAllAudio();

    currentSoundKey = soundKey;
    currentAudio = new Audio(soundFiles[soundKey]);
    currentAudio.volume = masterVolume;
    
    attachLoopListener(currentAudio);

    currentAudio.play().catch(error => {
        console.warn('Could not play audio. Check if the .mp3 file exists:', error);
    });

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
                pauseCurrentAudio();
            } else {
                currentAudio.play();
                isPlaying = true;
                updateMusicUI();
            }
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
            pauseCurrentAudio();
        } else {
            currentAudio.play();
            isPlaying = true;
            updateMusicUI();
        }
    });
}

//volume slider
if (volumeSlider) {
    volumeSlider.addEventListener('input', function () {
        masterVolume = this.value / 100;
        // If crossfading, the fadeInterval automatically uses the new masterVolume
        if (currentAudio && !isCrossfading) {
            currentAudio.volume = masterVolume;;
        }
    });
}