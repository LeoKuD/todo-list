const myForm = document.querySelector('.my-form');
const listCurrentTasks = document.getElementById('currentTasks');
const listCompletedTasks = document.getElementById('completedTasks');
const titleTodoBlock = document.getElementById('title-todo-block');
const titleCompletedBlock = document.getElementById('title-completed-block');
const content = document.getElementById('content');
const toggleTheme = document.getElementById('toggle-theme');
const btnAddTask = document.getElementById('btn-show-modal');
const btnSubmitForm = myForm.elements['btn-submit'];
const btnSubmitEditForm = btnSubmitForm.cloneNode(true);
btnSubmitEditForm.id = 'btnSubmitEditForm';
const bottomForm = document.getElementById('bottom-form');
const btnCloseForm = myForm.elements['btn-close'];
const titleHeaderForm = document.querySelector('.modal-title');
const exampleModal = document.getElementById('exampleModal');
const btnSortUp = document.getElementById('sort-up');
const btnSortDown = document.getElementById('sort-down');
const body = document.body;

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
let tasks;
let listenerSubmitEditTask = null;
let selectedSort;

const LOCALSTORAGEKEYS = {
  tasks: 'tasks',
  sorting: 'sorting',
  theme: 'theme',
  dark: 'dark',
  up: 'up',
  down: 'down',
};

const ELEMETSTEXTKEYS = {
  close: 'Close',
  cancel: 'Cancel',
  addTaks: 'Add task',
  editTaks: 'Edit task',
  save: 'Save',
};

const STYLESKEYS = {
  dataIndex: 'data-index',
  inlineBlock: 'inline-block',
  none: 'none',
};

const ELEMENTSKEYS = {
  btnDelete: 'btn-delete',
  btnCompleted: 'btn-completed',
  btnEdit: 'btn-edit',
  exampleModal: 'exampleModal',
  btnClose: 'btn-close',
};

tasks = JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.tasks)) || [];
selectedSort =
  JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.sorting)) ||
  LOCALSTORAGEKEYS.up;

const updateLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function Task(title, text, priority) {
  this.id = helpers.generateId();
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
      const taskItem = createTaskNode(item, index);
      if (selectedSort === LOCALSTORAGEKEYS.up) {
        !item.isDone
          ? listCurrentTasks.append(taskItem)
          : listCompletedTasks.append(taskItem);
      } else {
        !item.isDone
          ? listCurrentTasks.prepend(taskItem)
          : listCompletedTasks.prepend(taskItem);
      }
    });
  }
  const countCompletedTasks = tasks.filter((item) => item.isDone).length;
  titleTodoBlock.textContent = `ToDo (${tasks.length - countCompletedTasks})`;
  titleCompletedBlock.textContent = `Completed (${countCompletedTasks})`;
}

function createTaskNode(item, index) {
  const taskNode = document.createElement('li');
  // console.log(item.priority.toLowerCase());
  // const priority = item.priority.toLowerCase();
  taskNode.className = `list-group-item d-flex w-100 mb-2 ${item.priority.toLowerCase()}`;
  taskNode.innerHTML = `<div class="w-100 mr-2">
  <div class="d-flex w-100 justify-content-between">
    <h5 class="mb-1">${item.title}</h5>
    <div>
      <small class="mr-2">${item.priority} priority</small>
      <small>${helpers.getDate(item.date)}</small>
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

function taskSubmit() {
  const formValue = new FormData(myForm);
  tasks.push(new Task(...formValue.values()));
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
  btnCloseForm.click();
}

function completeTask(index) {
  tasks[index].isDone = !tasks[index].isDone;
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
}

function deleteTask(itemID) {
  tasks = tasks.filter((item) => item.id !== itemID);
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
}
function editTask(index) {
  showModal(index);
  titleHeaderForm.innerText = ELEMENTSKEYS.editTaks;
  myForm.elements.title.value = tasks[index].title;
  myForm.elements.text.value = tasks[index].text;
  myForm.elements[tasks[index].priority].checked = true;
}

function submitEditTask(index) {
  let formValue = new FormData(myForm);
  tasks[index].title = myForm.elements.title.value;
  tasks[index].text = myForm.elements.text.value;
  tasks[index].priority = formValue.get('priority');
  updateLocalStorage(LOCALSTORAGEKEYS.tasks, tasks);
  fillHTMLList();
  myForm['btn-close'].click();
}

function showModal(index) {
  btnAddTask.click();
  btnCloseForm.innerText = ELEMETSTEXTKEYS.cancel;
  btnSubmitEditForm.innerText = ELEMETSTEXTKEYS.save;
  btnSubmitEditForm.classList.add(STYLESKEYS.inlineBlock);
  btnSubmitEditForm.setAttribute(STYLESKEYS.dataIndex, index);
  btnSubmitForm.classList.add(STYLESKEYS.none);
  btnSubmitForm.classList.remove(STYLESKEYS.inlineBlock);
  bottomForm.append(btnSubmitEditForm);
}

content.addEventListener('click', (e) => {
  if (e.target.id === ELEMENTSKEYS.btnDelete) {
    deleteTask(e.target.getAttribute(STYLESKEYS.dataIndex));
  } else if (e.target.id === ELEMENTSKEYS.btnCompleted) {
    completeTask(e.target.getAttribute(STYLESKEYS.dataIndex));
  } else if (e.target.id === ELEMENTSKEYS.btnEdit) {
    editTask(e.target.getAttribute(STYLESKEYS.dataIndex));
  }
});

const helpers = {
  generateId: function generateId() {
    let ID = '';
    for (let i = 0; i < 12; i++) {
      ID += characters.charAt(Math.floor(Math.random() * 36));
    }
    return ID;
  },
  checkDate: function checkDate(date) {
    return date < 10 ? `0${date}` : date;
  },
  getDate: function getDate(stamp) {
    const date = new Date(stamp);
    const month =
      date.getMonth() < 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const day = this.checkDate(date.getDate());
    const hours = this.checkDate(date.getHours());
    const minutes = this.checkDate(date.getMinutes());
    const fullYear = date.getFullYear();
    return ` ${hours}:${minutes} ${day}.${month}.${fullYear}`;
  },
  setTheme: function setTheme() {
    body.classList.contains(LOCALSTORAGEKEYS.dark)
      ? updateLocalStorage(LOCALSTORAGEKEYS.theme, LOCALSTORAGEKEYS.dark)
      : localStorage.removeItem(LOCALSTORAGEKEYS.theme);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  if (
    JSON.parse(localStorage.getItem(LOCALSTORAGEKEYS.theme)) ===
    LOCALSTORAGEKEYS.dark
  ) {
    body.classList.add(LOCALSTORAGEKEYS.dark);
  }
});

myForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (e.submitter.id === btnSubmitForm.id) {
    taskSubmit();
  } else if (e.submitter.id === btnSubmitEditForm.id) {
    submitEditTask(e.submitter.getAttribute('data-index'));
  }
});

toggleTheme.addEventListener('click', () => {
  body.classList.toggle(LOCALSTORAGEKEYS.dark);
  helpers.setTheme();
});

btnSortUp.addEventListener('click', () => {
  selectedSort = LOCALSTORAGEKEYS.up;
  updateLocalStorage(LOCALSTORAGEKEYS.sorting, selectedSort);
  fillHTMLList();
});

btnSortDown.addEventListener('click', () => {
  selectedSort = LOCALSTORAGEKEYS.down;
  updateLocalStorage(LOCALSTORAGEKEYS.sorting, selectedSort);
  fillHTMLList();
});

btnAddTask.addEventListener('click', () => {
  myForm.reset();
  btnCloseForm.innerText = ELEMETSTEXTKEYS.close;
  btnSubmitForm.innerText = ELEMETSTEXTKEYS.addTaks;
  titleHeaderForm.innerText = ELEMETSTEXTKEYS.addTaks;
  btnSubmitForm.classList.add(STYLESKEYS.inlineBlock);
  btnSubmitEditForm.classList.add(STYLESKEYS.none);
  btnSubmitEditForm.classList.remove(STYLESKEYS.inlineBlock);
});

fillHTMLList();
