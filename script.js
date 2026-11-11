const checkboxes = document.querySelectorAll('.task-list input[type="checkbox"]');

checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
        const listItem = this.parentElement;
        if (this.checked){
            listItem.classList.add('completed');
        } else {
            listItem.classList.remove('completed');
        }
    });
});

const themeButton = document.querySelector('.theme-toggle');

themeButton.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
});