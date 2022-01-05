const myForm = document.forms[0];
const listCurrentTasks = document.getElementById('currentTasks');
const listCompletedTasks = document.getElementById('completedTasks');
const titleTodoBlock = document.getElementById('title-todo-block');
const titleCompletedBlock = document.getElementById('title-completed-block');
const content = document.getElementById('content');
const toggleTheme = document.getElementById('toggle-theme');
const btnAddTask = document.getElementById('btn-show-modal');
const btnSubmitForm = myForm.elements['btn-submit'];
const btnSubmitEditForm = btnSubmitForm.cloneNode(true);
const bottomForm = document.getElementById('bottom-form');
const btnCloseForm = myForm.elements['btn-close'];
const titleHeaderForm = document.querySelector('.modal-title');
const exampleModal = document.getElementById('exampleModal');
const btnSortUp = document.getElementById('sort-up');
const btnSortDown = document.getElementById('sort-down');
const body = document.body;

let tasks;
let listenerSubmitEditTask = null;
let selectedSort;
let selectedTheme;

const LOCALSTORAGEKEYS = {
  tasks: 'tasks',
  sorting: 'sorting',
  theme: 'theme',
};

const KEYSVARIABLES = {
  dark: 'dark',
  light: 'light',
  up: 'up',
  down: 'down',
  close: 'Close',
  cancel: 'Cancel',
  addTaks: 'Add task',
  editTaks: 'Edit task',
  btnDelete: 'btn-delete',
  dataIndex: 'data-index',
  btnCompleted: 'btn-completed',
  btnEdit: 'btn-edit',
  save: 'Save',
  exampleModal: 'exampleModal',
  btnClose: 'btn-close',
  closeRight: 'close-right',
};

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

document.addEventListener('DOMContentLoaded', () => {
  selectedTheme =
    JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.theme)) ||
    KEYSVARIABLES.light;
  body.classList.add(selectedTheme);
});

btnSubmitEditForm.id = 'btnSubmitEditForm';

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.submitter.id === btnSubmitForm.id) {
    taskSubmit();
  } else if (e.submitter.id === btnSubmitEditForm.id) {
    submitEditTask(e.submitter.getAttribute('data-index'));
  }
});

tasks = JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.tasks)) || [];
selectedSort =
  JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.sorting)) ||
  LOCALSTORAGEKEYS.up;

const generateId = () => {
  let ID = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
};

function Task([title, text, priority]) {
  this.id = generateId();
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
    tasks.forEach((item, index) => {
      const taskItem = taskTemplate(item, index);
      selectedSort === KEYSVARIABLES.up
        ? !item.isDone
          ? listCurrentTasks.append(taskItem)
          : listCompletedTasks.append(taskItem)
        : !item.isDone
        ? listCurrentTasks.prepend(taskItem)
        : listCompletedTasks.prepend(taskItem);
    });
  }
  const countCompletedTasks = tasks.filter((item) => item.isDone).length;
  titleTodoBlock.textContent = `ToDo (${tasks.length - countCompletedTasks})`;
  titleCompletedBlock.textContent = `Completed (${countCompletedTasks})`;
}

function checkDate(date) {
  if (date < 10) {
    return `0${date}`;
  }
  return date;
}

function getDate(stamp) {
  const date = new Date(stamp);
  const month =
    date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = checkDate(date.getDate());
  const hours = checkDate(date.getHours());
  const minutes = checkDate(date.getMinutes());
  const fullYear = date.getFullYear();
  return ` ${hours}:${minutes} ${day}.${month}.${fullYear}`;
}

function taskTemplate(item, index) {
  const taskNode = document.createElement('li');
  taskNode.className = `list-group-item d-flex w-100 mb-2 ${item.priority}`;
  taskNode.innerHTML = `<div class="w-100 mr-2">
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
</div>`;
  return taskNode;
}

btnAddTask.addEventListener('click', () => {
  btnCloseForm.innerText = KEYSVARIABLES.close;
  btnSubmitForm.innerText = KEYSVARIABLES.addTaks;
  titleHeaderForm.innerText = KEYSVARIABLES.addTaks;
});

function taskSubmit() {
  const formValue = new FormData(myForm);
  tasks.push(new Task([...formValue.values()]));
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
  myForm.reset();
  btnCloseForm.click();
}

function completeTask(index) {
  tasks[index].isDone = !tasks[index].isDone;
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
}

content.addEventListener('click', (e) => {
  if (e.target.id === KEYSVARIABLES.btnDelete) {
    deleteTask(e.target.getAttribute(KEYSVARIABLES.dataIndex));
  } else if (e.target.id === KEYSVARIABLES.btnCompleted) {
    completeTask(e.target.getAttribute(KEYSVARIABLES.dataIndex));
  } else if (e.target.id === KEYSVARIABLES.btnEdit) {
    editTask(e.target.getAttribute(KEYSVARIABLES.dataIndex));
  }
});

toggleTheme.addEventListener('click', () => {
  body.classList.toggle(selectedTheme);
  selectedTheme === KEYSVARIABLES.light
    ? (selectedTheme = KEYSVARIABLES.dark)
    : (selectedTheme = KEYSVARIABLES.light);
  body.classList.toggle(selectedTheme);
  updateLocalStorage(LOCALSTORAGEKEYS.theme, selectedTheme);
});

function deleteTask(itemID) {
  tasks = tasks.filter((item) => item.id !== itemID);
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
}
function editTask(index) {
  showModal(index);
  titleHeaderForm.innerText = KEYSVARIABLES.editTaks;

  myForm.elements.title.value = tasks[index].title;
  myForm.elements.text.value = tasks[index].text;
  myForm.elements.priority.forEach((item) => {
    item.id === tasks[index].priority
      ? (item.checked = true)
      : (item.checked = false);
  });
}

function submitEditTask(index) {
  let formValue = new FormData(myForm);
  tasks[index].title = myForm.elements.title.value;
  tasks[index].text = myForm.elements.text.value;
  tasks[index].priority = formValue.get('priority');
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
  myForm.reset();
  myForm['btn-close'].click();
}

function showModal(index) {
  btnAddTask.click();
  btnCloseForm.innerText = KEYSVARIABLES.cancel;
  btnSubmitEditForm.innerText = KEYSVARIABLES.save;
  btnSubmitEditForm.style.display = 'inline-block';
  btnSubmitEditForm.setAttribute(KEYSVARIABLES.dataIndex, index);
  btnSubmitForm.style.display = 'none';
  bottomForm.append(btnSubmitEditForm);
}

exampleModal.addEventListener('click', (e) => {
  if (
    e.target.id === KEYSVARIABLES.exampleModal ||
    e.target.id === KEYSVARIABLES.btnClose ||
    e.target.id === KEYSVARIABLES.closeRight
  ) {
    myForm.reset();
    btnSubmitForm.style.display = 'inline-block';
    btnSubmitEditForm.style.display = 'none';
  }
});

btnSortUp.addEventListener('click', () => {
  selectedSort = KEYSVARIABLES.up;
  updateLocalStorage(LOCALSTORAGEKEYS.sorting, selectedSort);
  fillHTMLList();
});

btnSortDown.addEventListener('click', () => {
  selectedSort = KEYSVARIABLES.down;
  updateLocalStorage(LOCALSTORAGEKEYS.sorting, selectedSort);
  fillHTMLList();
});

fillHTMLList();
