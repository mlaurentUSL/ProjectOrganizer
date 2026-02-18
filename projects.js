// projects.js
// DOM-driven project + task UI with localStorage persistence.
// If window.firebaseSync is present it will be used to sync after local changes.

const STORAGE_KEY = 'projectOrganizer.projects';

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProjectsLocal(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  // optional cloud sync if firebaseSync is initialized
  if (window.firebaseSync && typeof window.firebaseSync.saveProjects === 'function') {
    try { window.firebaseSync.saveProjects(projects); } catch { /* ignore */ }
  }
}

function confirmAction(message) {
  return window.confirm ? window.confirm(message) : true;
}

function addProject(name) {
  const projects = loadProjects();
  projects.push({ name, tasks: [] });
  saveProjectsLocal(projects);
  renderProjects();
}

function deleteProject(index) {
  if (!confirmAction('Delete this project?')) return;
  const projects = loadProjects();
  projects.splice(index, 1);
  saveProjectsLocal(projects);
  renderProjects();
}

function editProjectName(index, newName) {
  const projects = loadProjects();
  projects[index].name = newName;
  saveProjectsLocal(projects);
  renderProjects();
}

function addTask(index, taskText) {
  if (!taskText) return;
  const projects = loadProjects();
  projects[index].tasks.push(taskText);
  saveProjectsLocal(projects);
  renderProjects();
}

function deleteTask(projectIndex, taskIndex) {
  const projects = loadProjects();
  projects[projectIndex].tasks.splice(taskIndex, 1);
  saveProjectsLocal(projects);
  renderProjects();
}

function createProjectItem(p, idx) {
  const li = document.createElement('li');
  li.className = 'project-item';

  const header = document.createElement('div');
  header.className = 'project-header';

  const title = document.createElement('span');
  title.className = 'project-title';
  title.textContent = p.name;
  header.appendChild(title);

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'btn small';
  editBtn.addEventListener('click', () => {
    const newName = prompt('Edit project name', p.name);
    if (newName && newName.trim() !== '') editProjectName(idx, newName.trim());
  });
  header.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.className = 'btn small danger';
  delBtn.addEventListener('click', () => deleteProject(idx));
  header.appendChild(delBtn);

  li.appendChild(header);

  // tasks
  const taskList = document.createElement('ul');
  taskList.className = 'task-list';
  (p.tasks || []).forEach((t, ti) => {
    const tli = document.createElement('li');
    tli.textContent = t;
    const delTaskBtn = document.createElement('button');
    delTaskBtn.textContent = 'x';
    delTaskBtn.className = 'btn tiny danger';
    delTaskBtn.addEventListener('click', () => deleteTask(idx, ti));
    tli.appendChild(delTaskBtn);
    taskList.appendChild(tli);
  });
  li.appendChild(taskList);

  // add task form
  const taskForm = document.createElement('form');
  taskForm.className = 'add-task-form';
  const taskInput = document.createElement('input');
  taskInput.type = 'text';
  taskInput.placeholder = 'New task';
  taskInput.required = true;
  taskInput.className = 'task-input';
  const taskAdd = document.createElement('button');
  taskAdd.textContent = 'Add Task';
  taskAdd.className = 'btn small';
  taskForm.appendChild(taskInput);
  taskForm.appendChild(taskAdd);
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(idx, taskInput.value.trim());
    taskInput.value = '';
  });
  li.appendChild(taskForm);

  return li;
}

function renderProjects() {
  const listEl = document.getElementById('project-list');
  if (!listEl) return;
  listEl.innerHTML = '';
  const projects = loadProjects();
  if (projects.length === 0) {
    const p = document.createElement('li');
    p.textContent = 'No projects yet.';
    listEl.appendChild(p);
    return;
  }
  projects.forEach((p, idx) => {
    listEl.appendChild(createProjectItem(p, idx));
  });
}

function setupForm() {
  const form = document.getElementById('add-project-form');
  const input = document.getElementById('project-name');
  if (!form || !input) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    addProject(name);
    input.value = '';
  });
}

// Auth UI hooks (optional - uses firebase-sync.js if available)
function setupAuthUI() {
  const signInBtn = document.getElementById('sign-in-btn');
  const signOutBtn = document.getElementById('sign-out-btn');
  const userStatus = document.getElementById('user-status');

  if (!signInBtn || !signOutBtn || !userStatus) return;

  if (window.firebaseSync && typeof window.firebaseSync.observeAuth === 'function') {
    window.firebaseSync.observeAuth((user) => {
      if (user) {
        userStatus.textContent = user.email || 'Signed in';
        signInBtn.style.display = 'none';
        signOutBtn.style.display = '';
      } else {
        userStatus.textContent = 'Not signed in';
        signInBtn.style.display = '';
        signOutBtn.style.display = 'none';
      }
    });
  }

  signInBtn.addEventListener('click', () => {
    if (window.firebaseSync && typeof window.firebaseSync.openSignIn === 'function') {
      window.firebaseSync.openSignIn();
    } else {
      alert('Sign-in not configured. Configure Firebase in firebase-config.js to enable sign-in.');
    }
  });

  signOutBtn.addEventListener('click', () => {
    if (window.firebaseSync && typeof window.firebaseSync.signOut === 'function') {
      window.firebaseSync.signOut();
    } else {
      alert('Sign-out not configured.');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  renderProjects();
  setupAuthUI();

  // If firebaseSync supports subscribe to remote updates, use it to update local UI.
  if (window.firebaseSync && typeof window.firebaseSync.subscribe === 'function') {
    window.firebaseSync.subscribe((remoteProjects) => {
      if (!remoteProjects) return;
      // replace local data with remote data and render
      try {
        saveProjectsLocal(remoteProjects);
        renderProjects();
      } catch (e) { /* ignore */ }
    });
  }
});
