//dark mode toggle
const themeButton = document.querySelector('.theme-toggle');

themeButton.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});


//Navegação entre abas
const navTriggers = document.querySelectorAll('[data-target]');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const pageSections = document.querySelectorAll('.page-section');

function switchTab(targetId) {
    pageSections.forEach(section => {
        section.classList.toggle('active', section.id === targetId);
    });

    sidebarLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetId);
    });
}

navTriggers.forEach(trigger => {
    trigger.addEventListener('click', function (event){
        event.preventDefault();
        const targetId = this.dataset.target;
        switchTab(targetId);
    });
});
