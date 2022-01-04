const myForm = document.forms[0];
const listCurrentTasks = document.getElementById('currentTasks');
const listCompletedTasks = document.getElementById('completedTasks');
const titleTodoBlock = document.getElementById('title-todo-block');
const titleCompletedBlock = document.getElementById('title-completed-block');
const content = document.getElementById('content');
const toggleTheme = document.getElementById('toggle-theme');
const btnAddTask = document.getElementById('btn-show-modal');
const btnSubmitForm = myForm.elements['btn-submit'];
const btnCloseForm = myForm.elements['btn-close'];
const titleHeaderForm = document.querySelector('.modal-title');
const exampleModal = document.getElementById('exampleModal');
const btnSortUp = document.getElementById('sort-up');
const btnSortDown = document.getElementById('sort-down');

const body = document.body;
const dark = 'dark';
const light = 'light';
const up = 'up';
const down = 'down';
let tasks;
let listenerSubmitEditTask = null;
let defaultSort;
let defaultTheme;

const localStorageValues =  {
  tasks: 'tasks',
  sorting: 'sorting',
  theme: 'theme'
}

!localStorage[localStorageValues.tasks]
  ? (tasks = [])
  : (tasks = JSON.parse(localStorage.getItem(localStorageValues.tasks)));

!localStorage[localStorageValues.sorting]
  ? (defaultSort = up)
  : (defaultSort = JSON.parse(localStorage.getItem(localStorageValues.sorting)));

const makeId = () => {
  let ID = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
};

function Task([title, text, priority]) {
  this.id = makeId();
  this.date = Date.now();
  this.title = title;
  this.text = text;
  this.priority = priority;
  this.isDone = false;
}

function fillHTMLList() {
  listCurrentTasks.textContent = '';
  listCompletedTasks.textContent = '';
  if (tasks.length) {
    if (defaultSort === up) {
      tasks.forEach((item, index) => {
        !item.isDone ? listCurrentTasks.insertAdjacentHTML('beforeend', taskTemplate(item, index))
          : listCompletedTasks.insertAdjacentHTML('beforeend', taskTemplate(item, index));
      });
    } else {
      tasks.forEach((item, index) => {
        !item.isDone ? listCurrentTasks.insertAdjacentHTML('afterbegin', taskTemplate(item, index))
          : listCompletedTasks.insertAdjacentHTML('afterbegin',taskTemplate(item, index));
      });
    }
  }
  const countCompletedTasks = tasks.filter(
    (item) => item.isDone === true
  ).length;
  titleTodoBlock.textContent = `ToDo (${tasks.length - countCompletedTasks})`;
  titleCompletedBlock.textContent = `Completed (${countCompletedTasks})`;
}

function getDate(stamp) {
  const date = new Date(stamp);
  const month = date.getMonth() < 9 ? `0${date.getMonth()+1}` : date.getMonth()+1;
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  return ` ${date.getHours()}:${date.getMinutes()} ${day}.${month}.${date.getFullYear()}`;
}

function taskTemplate(item, index) {
  return `
    <li class="list-group-item d-flex w-100 mb-2 ${item.priority}">
              <div class="w-100 mr-2">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">${item.title}</h5>
                  <div>
                    <small class="mr-2">${item.priority} priority</small>
                    <small>${getDate(item.date)}</small>
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

                  <button data-index="${
                    item.id
                  }" type="button" class="btn btn-danger w-100" id="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </li>
    `;
}

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

btnAddTask.addEventListener('click', () => {
  btnCloseForm.innerText = 'Close';
  btnSubmitForm.innerText = 'Add Task';
  titleHeaderForm.innerText = `Add task`;
  myForm.addEventListener('submit', taskSubmit);
});

function taskSubmit(e) {
  e.preventDefault();
  const formValue = new FormData(myForm);
  tasks.push(new Task([...formValue.values()]));
  updateLocalStorage(localStorageValues.tasks, tasks);
  fillHTMLList();
  myForm.reset();
  btnCloseForm.click();
  myForm.removeEventListener('submit', taskSubmit);
}

function completeTask(index) {
  tasks[index].isDone = !tasks[index].isDone;
  updateLocalStorage(localStorageValues.tasks, tasks);
  fillHTMLList();
}

content.addEventListener('click', (e) => {
  if (e.target.id === 'btn-delete') {
    deleteTask(e.target.getAttribute('data-index'));
  } else if (e.target.id === 'btn-completed') {
    completeTask(e.target.getAttribute('data-index'));
  } else if (e.target.id === 'btn-edit') {
    editTask(e.target.getAttribute('data-index'));
  }
});

toggleTheme.addEventListener('click', () => {
  body.className === light
    ? ((defaultTheme = dark),
      body.classList.remove(light),
      body.classList.add(dark),
      updateLocalStorage(localStorageValues.theme, defaultTheme))
    : ((defaultTheme = light),
      body.classList.remove(dark),
      body.classList.add(light),
      updateLocalStorage(localStorageValues.theme, defaultTheme));
});

document.addEventListener('DOMContentLoaded', () => {
  !localStorage[localStorageValues.theme]
    ? (defaultTheme = light)
    : (defaultTheme = JSON.parse(localStorage.getItem(localStorageValues.theme)));

  body.classList.add(defaultTheme);
});

function deleteTask(itemID) {
  tasks = tasks.filter((item) => item.id !== itemID);
  updateLocalStorage(localStorageValues.tasks, tasks);
  fillHTMLList();
}
function editTask(index) {
  showModal();
  myForm.removeEventListener('submit', taskSubmit);
  titleHeaderForm.innerText = `Edit task`;

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
  updateLocalStorage(localStorageValues.tasks, tasks);
  fillHTMLList();
  myForm.removeEventListener('submit', listenerSubmitEditTask);
  myForm.reset();
  myForm['btn-close'].click();
}

function showModal() {
  btnAddTask.click();
  btnCloseForm.innerText = 'Cancel';
  btnSubmitForm.innerText = 'Save';
}

exampleModal.addEventListener('click', (e) => {
  if (
    e.target.id === 'exampleModal' ||
    e.target.id === 'btn-close' ||
    e.target.id === 'close-right'
  ) {
    myForm.removeEventListener('submit', listenerSubmitEditTask);
    myForm.removeEventListener('submit', taskSubmit);
    myForm.reset();
  }
});

btnSortUp.addEventListener('click', () => {
  defaultSort = up;
  updateLocalStorage(localStorageValues.sorting, defaultSort);
  fillHTMLList();
});

btnSortDown.addEventListener('click', () => {
  defaultSort = down;
  updateLocalStorage(localStorageValues.sorting, defaultSort);
  fillHTMLList();
});

fillHTMLList();
