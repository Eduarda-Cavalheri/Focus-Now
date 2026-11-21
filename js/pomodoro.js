let countdownTimer;
let isRunning = false;
let timeInSeconds = 50 * 60;
let isFocusMode = true;
let currentSessionCount = 1;

const statusBadge = document.getElementById('status-badge');
const timeLeftDisplay = document.getElementById('time-left');
const subjectBadge = document.querySelector('.subject-badge');
const subjectInput = document.getElementById('subject-input');

const focusPills = document.querySelectorAll('#focus-pills .time-pill');
const pausePills = document.querySelectorAll('#pause-pills .time-pill');
const sessionPills = document.querySelectorAll('#session-pills .time-pill');

if (subjectInput && subjectBadge) {
    subjectInput.addEventListener('input', function(event) {
        const text = event.target.value.trim();
        subjectBadge.textContent = text !== '' ? text : 'Subject';
    });
}

function handlePillSelection(pillsArray, clickedPill) {
    pillsArray.forEach(pill => pill.classList.remove('active-pill'));
    clickedPill.classList.add('active-pill');
}

focusPills.forEach(pill => {
    pill.addEventListener('click', function(){
        handlePillSelection(focusPills, this);

        const minutes = this.textContent.replace('m', '');
        timeLeftDisplay.textContent = `${minutes.padStart(2, '0')}:00`;

        timeInSeconds = parseInt(minutes) * 60;
        calculateTotalSessionTime();
    });
});

pausePills.forEach(pill => {
    pill.addEventListener('click', function() {
        handlePillSelection(pausePills, this);
        calculateTotalSessionTime();
    });
});

sessionPills.forEach(pill => {
    pill.addEventListener('click', function() {
        handlePillSelection(sessionPills, this);
        calculateTotalSessionTime();
    });
});


//start, pause,cancel

const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const cancelBtn = document.getElementById('cancel-btn');


function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;

    timeLeftDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${remainderSeconds.toString().padStart(2, '0')}`;
}

function updateStartButtonText() {
    if (!startBtn) return;
    startBtn.textContent = isFocusMode ? 'Start focus' : 'Start break';
}

//start focus
if (startBtn) {
    startBtn.addEventListener('click', function() {
        if (isRunning) return;

        isRunning = true;
        statusBadge.textContent = isFocusMode ? "🔥 Focusing..." : "☕ Break time";

        countdownTimer = setInterval(function() {
            timeInSeconds--;
            updateTimerDisplay(timeInSeconds);

            if (timeInSeconds <= 0) {
                clearInterval(countdownTimer);

                if (isFocusMode) {
                isFocusMode = false;
                updateStartButtonText();
                statusBadge.textContent = '☕ Break time';

                const activePause = document.querySelector('#pause-pills .active-pill');
                const pauseMinutes = parseInt(activePause.textContent.replace('m', ''));

                timeInSeconds = pauseMinutes * 60;
                updateTimerDisplay(timeInSeconds);

            } else {
                const activeSession = document.querySelector('#session-pills .active-pill');
                const totalSessionsSelected = parseInt(activeSession.textContent);

                if (currentSessionCount >= totalSessionsSelected) {
                        isRunning = false;
                        isFocusMode = true;
                        currentSessionCount = 1;
                        updateStartButtonText();
                        statusBadge.textContent = "🎉 Session Complete!";
                        alert('Congratulations! You completed all sessions.');
                        return;
                }

                currentSessionCount++;
                isFocusMode = true;
                updateStartButtonText();
                statusBadge.textContent = "🔥 Focusing...";

                const activeFocus = document.querySelector('#focus-pills .active-pill');
                const focusMinutes = parseInt(activeFocus.textContent.replace('m', ''));

                timeInSeconds = focusMinutes * 60;
                updateTimerDisplay(timeInSeconds);
            }

            isRunning = false;
        }
    }, 1000);
});
}

//pause
if (pauseBtn) {
    pauseBtn.addEventListener('click', function(){
        clearInterval(countdownTimer);
        isRunning = false;
    });
}

//cancel
if (cancelBtn) {
    cancelBtn.addEventListener('click', function(){
        clearInterval(countdownTimer);
        isRunning = false;
        isFocusMode = true;
        currentSessionCount = 1;

        updateStartButtonText();

        if (statusBadge) {
            statusBadge.textContent = 'Ready to start';
        }

        const activeFocusPill = document.querySelector('#focus-pills .active-pill');
        const minutes = activeFocusPill.textContent.replace('m', '');

        timeInSeconds = parseInt(minutes) * 60;
        updateTimerDisplay(timeInSeconds);
    });
}

//total time
const totalSessionDisplay = document.getElementById('total-session-time');
const netFocusDisplay =document.getElementById('net-focus-time');

function calculateTotalSessionTime(){
    const activeFocus = document.querySelector('#focus-pills .active-pill');
    const activePause = document.querySelector('#pause-pills .active-pill');
    const activeSession = document.querySelector('#session-pills .active-pill');

    const focusMinutes = parseInt(activeFocus.textContent.replace('m', ''));
    const pauseMinutes = parseInt(activePause.textContent.replace('m', ''));
    const sessionsCount = parseInt(activeSession.textContent);

    const totalMinutes = (focusMinutes + pauseMinutes) * sessionsCount;
    const totalHours = (totalMinutes / 60).toFixed(1);

    const netFocusMinutes = focusMinutes * sessionsCount;
    const netFocusHours = (netFocusMinutes / 60).toFixed(1);

    if (totalSessionDisplay && netFocusDisplay) {
        totalSessionDisplay.textContent = `${totalMinutes}m (${totalHours}h)`;
        netFocusDisplay.textContent = `${netFocusMinutes}m (${netFocusHours}h)`;
    }
}

calculateTotalSessionTime();