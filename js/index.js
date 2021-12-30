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
let tasks;
let listenerSubmitEditTask = null;
let defaultSort;
let defaultTheme;

!localStorage.tasks
  ? (tasks = [])
  : (tasks = JSON.parse(localStorage.getItem('tasks')));

!localStorage.sorting
  ? (defaultSort = 'up')
  : (defaultSort = localStorage.getItem('sorting'));

  makeId = () => {
    let ID = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for ( let i = 0; i < 12; i++ ) {
      ID += characters.charAt(Math.floor(Math.random() * 36));
    }
    return ID;
  }

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
    if (defaultSort === 'up') {
      tasks.forEach((item, index) => {
        if (!item.isDone) {
          listCurrentTasks.insertAdjacentHTML(
            'beforeend',
            taskTemplate(item, index)
          );
        } else {
          listCompletedTasks.insertAdjacentHTML(
            'beforeend',
            taskTemplate(item, index)
          );
        }
      });
    } else if (defaultSort === 'down') {
      tasks.forEach((item, index) => {
        if (!item.isDone) {
          listCurrentTasks.insertAdjacentHTML(
            'afterbegin',
            taskTemplate(item, index)
          );
        } else {
          listCompletedTasks.insertAdjacentHTML(
            'afterbegin',
            taskTemplate(item, index)
          );
        }
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
  return ` ${date.getHours()}:${date.getMinutes()} ${date.getDate()}.${date.getMonth()}.${date.getFullYear()}`;
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

                  <button data-index="${item.id}" type="button" class="btn btn-danger w-100" id="btn-delete">
                    Delete
                  </button>
                </div>
              </div>
            </li>
    `;
}

const updateLocalStorage = () => {
  localStorage.setItem('tasks', JSON.stringify(tasks));
};

const updateLocalStorageSorting = () => {
  localStorage.setItem('sorting', defaultSort);
};

const updateLocalStorageTheme = () => {
  localStorage.setItem('theme', defaultTheme);
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
  updateLocalStorage();
  fillHTMLList();
  myForm.reset();
  btnCloseForm.click();
  myForm.removeEventListener('submit', taskSubmit);
}

function completeTask(index) {
  tasks[index].isDone = !tasks[index].isDone;
  updateLocalStorage();
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
  body.className === 'light'
    ? (defaultTheme = 'dark', body.classList.remove('light'), body.classList.add('dark'), updateLocalStorageTheme())
    : (defaultTheme = 'light', body.classList.remove('dark'), body.classList.add('light'), updateLocalStorageTheme());
});

document.addEventListener("DOMContentLoaded", () => {
  !localStorage.theme
  ? (defaultTheme = 'light')
  : (defaultTheme = localStorage.getItem('theme'));

  body.classList.add(defaultTheme)
});

function deleteTask(itemID) {
  tasks = tasks.filter(item => item.id !== itemID)
  updateLocalStorage();
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
  updateLocalStorage();
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
  defaultSort = 'up';
  updateLocalStorageSorting()
  fillHTMLList();
});

btnSortDown.addEventListener('click', () => {
  defaultSort = 'down';
  updateLocalStorageSorting()
  fillHTMLList();
});

fillHTMLList();
