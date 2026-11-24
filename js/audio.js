
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

        //Also control the custom Youtube player volume
        if (youtubePlayer && typeof youtubePlayer.setVolume === 'function') {
            youtubePlayer.setVolume(this.value);
        }
    });
}


//  EXTERNAL MEDIA (YouTube)
const youtubeInput = document.getElementById('youtube-input');
const loadYoutubeBtn = document.getElementById('load-youtube-btn');
const mediaEmbedContainer = document.getElementById('media-embed-container');

let youtubePlayer = null;
let ytProgressInterval = null;

function formatAudioTime(totalSeconds) {
    if (!totalSeconds || isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function clearExternalMedia() {
    if (ytProgressInterval) {
        clearInterval(ytProgressInterval);
        ytProgressInterval = null;
    }

    if (youtubePlayer) {
        youtubePlayer.destroy();
        youtubePlayer = null;
    }

    if (mediaEmbedContainer) {
        mediaEmbedContainer.innerHTML = '';
    }
}

function getYoutubeVideoId(rawUrl) {
    try {
        const parsedUrl = new URL(rawUrl.trim());
        let videoId = null;

        // Case 1: Short link
        if (parsedUrl.hostname.includes('youtu.be')) {
            videoId = parsedUrl.pathname.slice(1);
        }

        // Case 2: Standard link
        else if (parsedUrl.hostname.includes('youtube.com')) {
            if (parsedUrl.searchParams.has('v')) {
                videoId = parsedUrl.searchParams.get('v');
            } else {
                // Case 3: Live streams or Shorts
                const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
                const specialPaths = ['live', 'shorts', 'embed'];

                if (specialPaths.includes(pathParts[0]) && pathParts[1]) {
                    videoId = pathParts[1];
                }
            }
        }

        return videoId || null;
    } catch (error) {
        return null;
    }
}

function createCloseButton(){
    const clearBtn = document.createElement('button');
    clearBtn.textContent = '✕ Close player';
    clearBtn.classList.add('clear-embed-btn');
    clearBtn.addEventListener('click', clearExternalMedia);
    return clearBtn;
}

//custom youtube player
function renderCustomYoutubePlayer(videoId) {
    if (!mediaEmbedContainer) return;
    if (typeof YT === 'undefined' || !YT.Player) {
        alert('YouTube player is still loading. Please try again in a second.');
        return;
    }

    if (isPlaying) pauseCurrentAudio();
    clearExternalMedia();

    mediaEmbedContainer.appendChild(createCloseButton());

    const card = document.createElement('div');
    card.classList.add('custom-player-card');
    card.innerHTML = `
        <div class="player-top">
            <img class="player-thumb" src="https://img.youtube.com/vi/${videoId}/mqdefault.jpg" alt="Video cover">
            <div class="player-info">
                <span class="player-title" id="yt-title">Loading track...</span>
                <span class="player-artist" id="yt-artist">YouTube</span>
            </div>
        </div>
        <div class="player-controls">
            <button class="player-ctrl-btn" id="yt-back-btn" title="Back 10s">←</button>
            <button class="player-ctrl-btn play-main" id="yt-play-btn" title="Play / Pause">▶</button>
            <button class="player-ctrl-btn" id="yt-fwd-btn" title="Forward 10s">→</button>
        </div>
        <div class="player-progress-row">
            <span class="player-time" id="yt-current-time">0:00</span>
            <input type="range" class="player-progress-bar" id="yt-progress" min="0" max="100" value="0">
            <span class="player-time" id="yt-duration">0:00</span>
        </div>
        <div class="yt-hidden-engine"><div id="yt-api-target"></div></div>
    `;

    mediaEmbedContainer.appendChild(card);

    const titleEl = document.getElementById('yt-title');
    const artistEl = document.getElementById('yt-artist');
    const playBtn = document.getElementById('yt-play-btn');
    const backBtn = document.getElementById('yt-back-btn');
    const fwdBtn = document.getElementById('yt-fwd-btn');
    const currentTimeEl = document.getElementById('yt-current-time');
    const durationEl = document.getElementById('yt-duration');
    const progressBar = document.getElementById('yt-progress');

    youtubePlayer = new YT.Player('yt-api-target', {
        height: '1',
        width: '1',
        videoId: videoId,
        playerVars: { autoplay: 1, controls: 0 },
        events: {
            onReady: function (event) {
                event.target.setVolume(masterVolume * 100);
                const data = event.target.getVideoData();
                if (data.title) titleEl.textContent = data.title;
                if (data.author) artistEl.textContent = data.author;

                // Update progress bar and timestamps every second
                ytProgressInterval = setInterval(function () {
                    if (!youtubePlayer || typeof youtubePlayer.getCurrentTime !== 'function') return;

                    const current = youtubePlayer.getCurrentTime();
                    const total = youtubePlayer.getDuration();

                    if (total > 0) {
                        currentTimeEl.textContent = formatAudioTime(current);
                        durationEl.textContent = formatAudioTime(total);
                        progressBar.max = Math.floor(total);
                        progressBar.value = Math.floor(current);
                    } else {
                        currentTimeEl.textContent = 'LIVE';
                        durationEl.textContent = '∞';
                    }
                }, 1000);
            },
            onStateChange: function (event) {
                // YT.PlayerState.PLAYING === 1
                playBtn.textContent = event.data === YT.PlayerState.PLAYING ? '⏸' : '▶';
            }
        }
    });

playBtn.addEventListener('click', function () {
        if (!youtubePlayer) return;
        const state = youtubePlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            youtubePlayer.pauseVideo();
        } else {
            youtubePlayer.playVideo();
        }
    });

    backBtn.addEventListener('click', function () {
        if (!youtubePlayer) return;
        youtubePlayer.seekTo(Math.max(0, youtubePlayer.getCurrentTime() - 10), true);
    });

    fwdBtn.addEventListener('click', function () {
        if (!youtubePlayer) return;
        youtubePlayer.seekTo(youtubePlayer.getCurrentTime() + 10, true);
    });

    progressBar.addEventListener('input', function () {
        if (!youtubePlayer) return;
        youtubePlayer.seekTo(Number(this.value), true);
    });
}

//Youtube events
function handleYoutubeLoad() {
    const videoId = getYoutubeVideoId(youtubeInput.value);

    if (!videoId) {
        alert('Please enter a valid YouTube video or live stream URL.');
        return;
    }

    renderCustomYoutubePlayer(videoId);
    youtubeInput.value = '';
}

if (loadYoutubeBtn && youtubeInput) {
    loadYoutubeBtn.addEventListener('click', handleYoutubeLoad);
    youtubeInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') handleYoutubeLoad();
    });
}