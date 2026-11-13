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

//calendar

function gerarCalendario(containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = dataAtual.getMonth();
    const diaDeHoje = dataAtual.getDate();

    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();

    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    //preencher os dias vazios antes do dia 1
    for (let i =0; i < primeiroDiaDaSemana; i++) {
        const espacoVazio = document.createElement('div');
        espacoVazio.style.visibility = 'hidden';
        container.appendChild(espacoVazio);
    }

    for (let dia = 1; dia <= totalDiasNoMes; dia ++) {
        const caixaDia = document.createElement('div');
        caixaDia.classList.add('day');
        caixaDia.textContent = dia;

        if (dia === diaDeHoje) {
            caixaDia.classList.add('today');
        }

        container.appendChild(caixaDia);
    }
}

gerarCalendario('calendar-days');

function atualizarTitulosDeData() {
    const dataAtual = new Date();

    const opcoesHeader = {month: 'long', day: '2-digit', year: 'numeric'};

    const dataHeaderString = dataAtual.toLocaleDateString('en-US', opcoesHeader);

    const opcoesCalendario = {month: 'long', year: 'numeric'};

    const dataCalendarioString = dataAtual.toLocaleDateString('en-US', opcoesCalendario);

    const headerDateElement = document.getElementById('header-date');
    const calendarTitleElement = document.getElementById('calendar-month-title');

    if (headerDateElement) {
        headerDateElement.textContent = dataHeaderString;
    }

    if (calendarTitleElement) {
        calendarTitleElement.textContent = dataCalendarioString;
    }
}

atualizarTitulosDeData();

//task manager

const taskInput = document.getElementById('task-input');
const taskListContainer = document.getElementById('task-list-container');
const emptyMessage = document.getElementById('empty-task-message');

if (taskInput) {
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' && taskInput.value.trim() !== '') {
            const taskText = taskInput.value.trim();

            createTaskElement(taskText);

            taskInput.value = '';

            emptyMessage.style.display = 'none'
        }
    });
}

function createTaskElement(text) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const label = document.createElement('label');
    label.textContent = text;

    taskContent.appendChild(checkbox);
    taskContent.appendChild(label);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '&#10005;';

    deleteBtn.addEventListener('click', function(){
        taskItem.remove();

        if (taskListContainer.children.length === 0) {
            emptyMessage.style.display = 'block';
        }
    });

    taskItem.appendChild(taskContent);
    taskItem.appendChild(deleteBtn);

    taskListContainer.appendChild(taskItem);
}