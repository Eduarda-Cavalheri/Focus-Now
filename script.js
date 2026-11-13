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