const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskListContainer = document.getElementById('task-list-container');
const emptyMessage = document.getElementById('empty-task-message');


function handleAddTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== '') {
        createTaskElement(taskText);
        taskInput.value = '';
        emptyMessage.style.display = 'none';
    }
}

if (taskInput) {
    taskInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleAddTask();
        }
    });
}
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', function() {
        handleAddTask();
    });
}



function createTaskElement(text) {
    const taskItem = document.createElement('div');
    taskItem.classList.add('task-item');

    const taskContent = document.createElement('div');
    taskContent.classList.add('task-content');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    const uniqueId = 'task-' + Date.now();
    checkbox.id = uniqueId;

    const label = document.createElement('label');
    label.textContent = text;
    label.htmlFor = uniqueId;
    label.style.cursor = 'pointer';

    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            label.classList.add('completed');
        } else {
            label.classList.remove('completed');
        }
    });

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

