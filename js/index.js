const myForm = document.getElementsByTagName('form')[0];

let tasks;

!localStorage.tasks
  ? (tasks = [])
  : (tasks = JSON.parse(localStorage.getItem('tasks')));

function Task([title, text, priority]) {
  this.id = Date.now();
  this.title = title;
  this.text = text;
  this.priority = priority;
  this.isDone = false;
}

function fillHTMLList() {
  const listCurrentTasks = document.getElementById('currentTasks');
  const listCompletedTasks = document.getElementById('completedTasks');
  const titleTodoBlock = document.getElementById('title-todo-block');
  const titleCompletedBlock = document.getElementById('title-completed-block');
  listCurrentTasks.innerHTML = '';
  listCompletedTasks.innerHTML = '';
  if (tasks.length) {
    tasks.forEach((item, index) => {
      if (!item.isDone) {
        listCurrentTasks.innerHTML += taskTemplate(item, index);
      } else {
        listCompletedTasks.innerHTML += taskTemplate(item, index);
      }
      titleTodoBlock.innerHTML = `ToDo (${
        tasks.filter((item) => item.isDone === false).length
      })`;
      titleCompletedBlock.innerHTML = `Completed (${
        tasks.filter((item) => item.isDone === true).length
      })`;
    });
  }
}

function getDate(stamp) {
  return `${new Date(stamp).getFullYear()}-${new Date(
    stamp
  ).getMonth()}-${new Date(stamp).getDate()} ${new Date(
    stamp
  ).getHours()}:${new Date(stamp).getMinutes()}:${new Date(
    stamp
  ).getSeconds()}`;
}

function taskTemplate(item, index) {
  return `
    <li class="list-group-item d-flex w-100 mb-2 ${item.priority}">
              <div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">${item.title}</h5>
                  <div>
                    <small class="mr-2">${item.priority}</small>
                    <small>${getDate(item.id)}</small>
                  </div>
                </div>
                <p class="mb-1 w-100">
                  ${item.text}
                </p>
              </div>
              <div class="dropdown m-2 dropleft">
                <button class="btn btn-secondary h-100" type="button" id="dropdownMenuItem1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="fas fa-ellipsis-v" aria-hidden="true"></i>
                </button>
                <div class="dropdown-menu p-2 flex-column" id="dropdownMenuItem1" aria-labelledby="dropdownMenuItem1">
                  <button id="btn-completed" data-index="${index}" type="button" class="btn btn-success w-100">
                    ${item.isDone ? `Uncomplete` : `Complete`}
                  </button>
                  ${
                    !item.isDone
                      ? `
                      <button
                        id="btn-edit"
                        data-index="${index}"
                        type="button"
                        class="btn btn-info w-100 my-2"
                      >
                        Edit
                      </button>`
                      : '<div class="empty-div"></div>'
                  }

                  <button data-index="${index}" type="button" class="btn btn-danger w-100" id="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </li>
    `;
}

const updateLocalStorege = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

document.getElementById('btn-show-modal').addEventListener('click', (e) => {
  if (e.target.getAttribute('data-index') === null) {
    myForm.reset();
    myForm.elements['btn-close'].innerText = 'Close';
    myForm.elements['btn-submit'].innerText = 'Add Task';
    document.querySelector('.modal-title').innerText = `Add task`;
    myForm.addEventListener('submit', taskSubmit, { once: true });
  }
});

function taskSubmit(e) {
  e.preventDefault();
  const formValue = new FormData(myForm);
  tasks.push(new Task([...formValue.values()]));
  updateLocalStorege();
  fillHTMLList();
  myForm.reset();
  myForm['btn-close'].click();
  myForm.removeEventListener('submit', taskSubmit);
}

function completeTask(index) {
  tasks[index].isDone = !tasks[index].isDone;
  updateLocalStorege();
  fillHTMLList();
}

document.getElementById('all-content').addEventListener('click', (e) => {
  if (e.target.id === 'btn-delete' && e.target.getAttribute('data-index')) {
    console.log(e.target.getAttribute('data-index'));
    deleteTask(e.target.getAttribute('data-index'));
  } else if (
    e.target.id === 'btn-completed' &&
    e.target.getAttribute('data-index')
  ) {
    completeTask(e.target.getAttribute('data-index'));
  } else if (
    e.target.id === 'btn-edit' &&
    e.target.getAttribute('data-index')
  ) {
    showEditTask(e.target.getAttribute('data-index'));
  }
});

document.getElementById('toggle-theme').addEventListener('click', (e) => {
  document.body.classList.toggle('dark');
  document.getElementsByTagName('nav')[0].classList.toggle('dark');
  myForm.classList.toggle('dark');
  document.querySelector('.modal-content').classList.toggle('dark');
});

function deleteTask(index) {
  tasks.splice(index, 1);
  updateLocalStorege();
  fillHTMLList();
}
let listenerSubmitEditTask;
function showEditTask(index) {
  showModal(index);
  myForm.removeEventListener('submit', taskSubmit);
  document.querySelector('.modal-title').innerText = `Edit task`;

  myForm.elements.title.value = tasks[index].title;
  myForm.elements.text.value = tasks[index].text;
  myForm.elements.priority.forEach((item) => {
    item.id === tasks[index].priority
      ? (item.checked = true)
      : (item.checked = false);
  });
  listenerSubmitEditTask = submitEditTask.bind(null, index);
  myForm.addEventListener('submit', listenerSubmitEditTask);
}

function submitEditTask(index, e) {
  e.preventDefault();
  let formValue = new FormData(myForm);
  tasks[index].title = myForm.elements.title.value;
  tasks[index].text = myForm.elements.text.value;
  tasks[index].priority = formValue.get('priority');
  updateLocalStorege();
  fillHTMLList();
  myForm.removeEventListener('submit', listenerSubmitEditTask);
  myForm.reset();
  myForm['btn-close'].click();
}

function showModal(index) {
  document.getElementById('btn-show-modal').setAttribute('data-index', index);
  document.getElementById('btn-show-modal').click(index);
  myForm.elements['btn-close'].innerText = 'Cancel';
  myForm.elements['btn-submit'].innerText = 'Save';
  document.getElementById('btn-close').addEventListener(
    'click',
    () => {
      document.getElementById('btn-show-modal').removeAttribute('data-index');
    },
    { once: true }
  );
}

document.getElementById('exampleModal').addEventListener('click', (e) => {
  console.log(e.target.id);
  if (
    e.target.id === 'exampleModal' ||
    e.target.id === 'btn-close' ||
    e.target.id === 'close-right'
  ) {
    myForm.removeEventListener('submit', listenerSubmitEditTask);
    myForm.reset();
  }
});

function sortUp(arr) {
  tasks = arr.sort((a, b) => a.id - b.id);
  updateLocalStorege();
  fillHTMLList();
}

function sortDown(arr) {
  tasks = arr.sort((a, b) => b.id - a.id);
  updateLocalStorege();
  fillHTMLList();
}

document.getElementById('sorting').addEventListener('click', (e) => {
  if (
    e.target.className === 'btn btn-primary mx-2' ||
    e.target.className === 'fas fa-sort-numeric-up-alt'
  ) {
    sortUp(tasks);
  }
  if (
    e.target.className === 'fas fa-sort-numeric-up' ||
    e.target.className === 'btn btn-primary'
  ) {
    sortDown(tasks);
  }
});

fillHTMLList();
