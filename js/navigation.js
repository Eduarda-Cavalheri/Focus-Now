//dark mode toggle
const themeButton = document.querySelector('.theme-toggle');

themeButton.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});

