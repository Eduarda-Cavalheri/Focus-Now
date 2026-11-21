const today = new Date(); // Fixed reference for the real current date
let displayedDate = new Date(today.getFullYear(), today.getMonth(), 1);

const headerDateElement = document.getElementById('header-date');
const calendarTitleElement = document.getElementById('calendar-month-title');
const calendarDaysContainer = document.getElementById('calendar-days');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');


function updateHeaderDate() {
    if (!headerDateElement) return;

    const headerOptions = { month: 'long', day: '2-digit', year: 'numeric' };
    headerDateElement.textContent = today.toLocaleDateString('en-US',headerOptions);
}

function renderCalendar() {
    if (!calendarDaysContainer || !calendarTitleElement) return;

    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    // Update the calendar month/year title (e.g., "November 2026")
    const titleOptions = { month: 'long', year: 'numeric' };
    calendarTitleElement.textContent = displayedDate.toLocaleDateString('en-US', titleOptions);

    // Clear previous days and re-insert the weekday headers
    calendarDaysContainer.innerHTML = '';
    const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    weekdays.forEach(dayLabel => {
        const weekdayElement = document.createElement('div');
        weekdayElement.classList.add('weekday');
        weekdayElement.textContent = dayLabel;
        calendarDaysContainer.appendChild(weekdayElement);
    });

    // Calculate calendar structure
    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill empty slots before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptySlot = document.createElement('div');
        emptySlot.style.visibility = 'hidden';
        calendarDaysContainer.appendChild(emptySlot);
    }

    // Create each day of the month
    for (let day = 1; day <= totalDaysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('day');
        dayElement.textContent = day;

        // Only highlight "today" if day, month and year match
        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        if (isToday) {
            dayElement.classList.add('today');
        }

        calendarDaysContainer.appendChild(dayElement);
    }
}


if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', function () {
        displayedDate.setMonth(displayedDate.getMonth() - 1);
        renderCalendar();
    });
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', function () {
        displayedDate.setMonth(displayedDate.getMonth() + 1);
        renderCalendar();
    });
}

renderCalendar();
updateHeaderDate();