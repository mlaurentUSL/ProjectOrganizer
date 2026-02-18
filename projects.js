// projects.js
// Enhanced project management with localStorage persistence and optional Firebase sync
// Provides full CRUD operations for projects and tasks

const STORAGE_KEY = 'projectOrganizer.projects';

// Load projects from localStorage
function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

// Save projects to localStorage and optionally sync to Firebase
function saveProjectsLocal(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  
  // Sync to Firebase if available
  if (window.firebaseSync && typeof window.firebaseSync.saveProjects === 'function') {
    window.firebaseSync.saveProjects(projects);
  }
}

// Add a new project
function addProject(name) {
  const projects = loadProjects();
  projects.push({ 
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 11), 
    name, 
    tasks: [] 
  });
  saveProjectsLocal(projects);
  renderProjects();
}

// Delete a project by index
function deleteProject(index) {
  const projects = loadProjects();
  projects.splice(index, 1);
  saveProjectsLocal(projects);
  renderProjects();
}

// Edit project name by index
function editProjectName(index, newName) {
  const projects = loadProjects();
  if (projects[index]) {
    projects[index].name = newName;
    saveProjectsLocal(projects);
    renderProjects();
  }
}

// Add a task to a project by index
function addTask(projectIndex, taskName) {
  const projects = loadProjects();
  if (projects[projectIndex]) {
    if (!projects[projectIndex].tasks) {
      projects[projectIndex].tasks = [];
    }
    projects[projectIndex].tasks.push(taskName);
    saveProjectsLocal(projects);
    renderProjects();
  }
}

// Delete a task from a project
function deleteTask(projectIndex, taskIndex) {
  const projects = loadProjects();
  if (projects[projectIndex] && projects[projectIndex].tasks) {
    projects[projectIndex].tasks.splice(taskIndex, 1);
    saveProjectsLocal(projects);
    renderProjects();
  }
}

// Render all projects and tasks into the DOM
function renderProjects() {
  const list = document.getElementById('project-list');
  if (!list) return;
  
  list.innerHTML = ''; // clear current list

  const projects = loadProjects();
  if (projects.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No projects yet. Add one below!';
    li.style.fontStyle = 'italic';
    list.appendChild(li);
    return;
  }

  projects.forEach((project, projectIdx) => {
    const li = document.createElement('li');
    li.className = 'project-item';

    // Project name (editable on double-click)
    const title = document.createElement('strong');
    title.textContent = project.name;
    title.style.cursor = 'pointer';
    title.title = 'Double-click to edit';
    title.addEventListener('dblclick', () => {
      const newName = prompt('Edit project name:', project.name);
      if (newName && newName.trim()) {
        editProjectName(projectIdx, newName.trim());
      }
    });
    li.appendChild(title);

    // Delete project button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'button delete-btn';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Delete project "${project.name}"?`)) {
        deleteProject(projectIdx);
      }
    });
    li.appendChild(deleteBtn);

    // Tasks section
    if (project.tasks && project.tasks.length > 0) {
      const taskList = document.createElement('ul');
      taskList.className = 'task-list';
      project.tasks.forEach((task, taskIdx) => {
        const taskLi = document.createElement('li');
        taskLi.textContent = task;
        
        // Delete task button
        const deleteTaskBtn = document.createElement('button');
        deleteTaskBtn.textContent = '×';
        deleteTaskBtn.className = 'button delete-task-btn';
        deleteTaskBtn.style.marginLeft = '5px';
        deleteTaskBtn.addEventListener('click', () => {
          deleteTask(projectIdx, taskIdx);
        });
        taskLi.appendChild(deleteTaskBtn);
        taskList.appendChild(taskLi);
      });
      li.appendChild(taskList);
    }

    // Add task form
    const addTaskForm = document.createElement('form');
    addTaskForm.className = 'add-task-form';
    addTaskForm.style.marginTop = '8px';
    
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.placeholder = 'New task...';
    taskInput.className = 'task-input';
    
    const addTaskBtn = document.createElement('button');
    addTaskBtn.type = 'submit';
    addTaskBtn.textContent = 'Add Task';
    addTaskBtn.className = 'button add-task-btn';
    
    addTaskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const taskName = taskInput.value.trim();
      if (taskName) {
        addTask(projectIdx, taskName);
        taskInput.value = '';
      }
    });
    
    addTaskForm.appendChild(taskInput);
    addTaskForm.appendChild(addTaskBtn);
    li.appendChild(addTaskForm);

    list.appendChild(li);
  });
}

// Setup the add project form
function setupForm() {
  const form = document.getElementById('add-project-form');
  const input = document.getElementById('project-name');

  if (!form || !input) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;

    addProject(name);
    input.value = '';
  });
}

// Setup auth UI hooks (sign in/out buttons)
function setupAuthUI() {
  const signInBtn = document.getElementById('sign-in-btn');
  const signOutBtn = document.getElementById('sign-out-btn');
  const userInfo = document.getElementById('user-info');

  if (!signInBtn || !signOutBtn || !userInfo) return;

  // Sign in button handler
  signInBtn.addEventListener('click', () => {
    if (window.firebaseSync && typeof window.firebaseSync.openSignIn === 'function') {
      window.firebaseSync.openSignIn();
    } else {
      alert('Firebase authentication not available. Run locally without sign-in.');
    }
  });

  // Sign out button handler
  signOutBtn.addEventListener('click', () => {
    if (window.firebaseSync && typeof window.firebaseSync.signOut === 'function') {
      window.firebaseSync.signOut();
    }
  });

  // Observe auth state changes if Firebase is available
  if (window.firebaseSync && typeof window.firebaseSync.observeAuth === 'function') {
    window.firebaseSync.observeAuth((user) => {
      if (user) {
        userInfo.textContent = `Signed in: ${user.email || user.uid}`;
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
      } else {
        userInfo.textContent = 'Not signed in';
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
      }
    });
  }
}

// Handle remote updates from Firebase
function handleRemoteUpdate(remoteProjects) {
  if (remoteProjects && Array.isArray(remoteProjects)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remoteProjects));
    renderProjects();
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  setupAuthUI();
  renderProjects();
  
  // Subscribe to remote updates if Firebase is available
  if (window.firebaseSync && typeof window.firebaseSync.subscribe === 'function') {
    window.firebaseSync.subscribe(handleRemoteUpdate);
  }
});
