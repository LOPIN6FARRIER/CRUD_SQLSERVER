const formulario = document.getElementById('formulario');

formulario.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(formulario);
    const taskName = formData.get('tarea');
    const createdAt = formData.get('fecha');
    await createTask(taskName, createdAt);
    loadTasks(); // Recargar las tareas después de agregar una nueva
});

async function createTask(taskName, createdAt) {
    try {
        await fetch('http://localhost:3000/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                TaskName: taskName,
                CreatedAt: createdAt        
            })
        });
    } catch (error) {
        console.error('Error creating task:', error);
    }
}

async function loadTasks() {
    try {
        const res = await fetch('http://localhost:3000/tasks');
        const tasks = await res.json();
        const taskList = document.getElementById('task-list');
        let html = '';

        tasks.forEach((task, index) => {
            // Aplica la clase 'beige' si el índice es impar
            const rowClass = index % 2 === 1 ? 'beige' : '';
            html += `
                <tr class="${rowClass}">
                    <td ondblclick="makeEditable(this)">${task.TaskName}</td>
                    <td ondblclick="makeEditable(this)">${new Date(task.CreatedAt).toLocaleDateString()}</td>
                    <td>
                        <button class="edit" data-id="${task.TaskID}">Editar</button>
                        <button class="delete" data-id="${task.TaskID}">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        taskList.innerHTML = html;

        // Añadir listeners después de renderizar las tareas
        document.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', function() {
                deleteTask(this.dataset.id);
            });
        });

        document.querySelectorAll('.edit').forEach(button => {
            button.addEventListener('click', function() {
                editTask(this.dataset.id);
            });
        });
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`http://localhost:3000/delete-task/${id}`, {
            method: 'DELETE'
        });
        await loadTasks(); // Recargar las tareas después de eliminar una
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function editTask(id) {
    try {
        const res = await fetch(`http://localhost:3000/task/${id}`);
        const task = await res.json();
        
        // Mostrar el formulario con los datos de la tarea
        const formContainer = document.getElementById('edit-form-container');
        const taskNameInput = document.getElementById('tareaEdit');
        const taskDateInput = document.getElementById('fechaEdit');
        const taskIdInput = document.getElementById('idEdit');

        taskNameInput.value = task.TaskName;
        taskDateInput.value = new Date(task.CreatedAt).toISOString().split('T')[0];
        taskIdInput.value = task.TaskID;

        formContainer.style.display = 'block';

        document.getElementById('edit-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            const updatedTaskName = taskNameInput.value;
            const updatedDate = taskDateInput.value;
            
            await updateTask(taskIdInput.value, updatedTaskName, updatedDate);
            formContainer.style.display = 'none'; // Ocultar el formulario después de actualizar
            loadTasks(); // Recargar las tareas después de la actualización
        });

        document.getElementById('cancel-edit').addEventListener('click', function() {
            formContainer.style.display = 'none'; // Ocultar el formulario si se cancela
        });

    } catch (error) {
        console.error('Error editing task:', error);
    }
}

async function updateTask(id, taskName, createdAt) {
    try {
        await fetch(`http://localhost:3000/update-task/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                TaskName: taskName,
                CreatedAt: createdAt        
            })
        });
    } catch (error) {
        console.error('Error updating task:', error);
    }
}



loadTasks();
