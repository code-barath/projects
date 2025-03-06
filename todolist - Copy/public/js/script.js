// Function to load tasks and animate their appearance
function loadTasks() {
    fetch('/tasks')
      .then(response => response.json())
      .then(tasks => {
        const tasksList = document.querySelector('.tasks-list');
        tasksList.innerHTML = "";
        tasks.forEach(task => {
          const taskElement = document.createElement('div');
          taskElement.classList.add('task');
          taskElement.innerHTML = `
            <div class="task-content">
              <div class="task-title">${task.task_name}</div>
              <div class="task-deadline">Due: ${new Date(task.deadline).toLocaleString()}</div>
              <div class="task-countdown" data-deadline="${task.deadline}"></div>
              <div class="buttons">
                <button class="extend-btn" data-id="${task.id}">Extend</button>
                <div class="extend-form" data-id="${task.id}">
                  <input type="datetime-local" class="new-deadline-input" required>
                  <button class="submit-extend-btn" data-id="${task.id}">Submit</button>
                </div>
                <button class="complete-btn" data-id="${task.id}">Done</button>
              </div>
            </div>
          `;
          tasksList.appendChild(taskElement);
          taskElement.classList.add('drop-in');
        });
  
        // Extend Deadline toggle
        document.querySelectorAll('.extend-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            const form = document.querySelector(`.extend-form[data-id="${id}"]`);
            form.style.display = (form.style.display === "block") ? "none" : "block";
          });
        });
  
        // Extend Deadline submission
        document.querySelectorAll('.submit-extend-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            const form = document.querySelector(`.extend-form[data-id="${id}"]`);
            const newDeadline = form.querySelector('.new-deadline-input').value;
            if (!newDeadline) {
              alert('Select a new deadline, please!');
              return;
            }
            fetch(`/tasks/${id}/extend`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ new_deadline: newDeadline })
            })
            .then(response => {
              if (!response.ok) throw new Error('Could not extend deadline');
              return response.json();
            })
            .then(() => {
              form.style.display = "none";
              loadTasks();
            })
            .catch(error => console.error(error));
          });
        });
  
        // Mark Completed / Delete Task with a fade-out effect
        document.querySelectorAll('.complete-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            const id = btn.getAttribute('data-id');
            if (confirm('Mark this task as completed?')) {
              const taskElem = btn.closest('.task');
              taskElem.classList.add('fade-out');
              setTimeout(() => {
                fetch(`/tasks/${id}`, { method: 'DELETE' })
                  .then(response => {
                    if (!response.ok) throw new Error('Could not delete task');
                    return response.json();
                  })
                  .then(() => loadTasks())
                  .catch(error => console.error(error));
              }, 600);
            }
          });
        });
      })
      .catch(error => console.error('Error loading tasks:', error));
  }
  
  // Update countdown timers for each task
  function updateCountdowns() {
    const countdowns = document.querySelectorAll('.task-countdown');
    countdowns.forEach(el => {
      const deadline = new Date(el.getAttribute('data-deadline'));
      const now = new Date();
      let diff = deadline - now;
      if (diff <= 0) {
        el.textContent = 'Time’s up!';
        el.classList.add('overdue');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * 1000 * 60 * 60 * 24;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * 1000 * 60 * 60;
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * 1000 * 60;
      const seconds = Math.floor(diff / 1000);
      el.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s left`;
    });
  }
  
  loadTasks();
  setInterval(updateCountdowns, 1000);
  
  // New Task Form Submission
  document.getElementById('new-task-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
      task_name: form.task_name.value,
      deadline: form.deadline.value
    };
    fetch('/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => {
      if (!response.ok) throw new Error('Could not add task');
      return response.json();
    })
    .then(() => {
      form.reset();
      loadTasks();
    })
    .catch(error => console.error(error));
  });
  