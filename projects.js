// projects.js
// DOM-driven project + task UI with localStorage persistence.
// If window.firebaseSync is present it will be used to sync after local changes.

const STORAGE_KEY = 'projectOrganizer.projects';
const ACTIVITIES_KEY = 'projectOrganizer.activities';

// Activity state
let currentSelectedProject = null;
let currentActivityTab = 'time';

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProjectsLocal(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  // optional cloud sync if firebaseSync is initialized - save each project as item
  if (window.firebaseSync && typeof window.firebaseSync.saveItem === 'function') {
    projects.forEach((p, idx) => {
      try {
        // Create a flat item object for each project
        // NOTE: Using 'name' as 'fullCode' for backward compatibility with simple projects.
        // In a more complex system, fullCode would be a unique identifier like clientNumber-projectCode.
        const item = {
          name: p.name,
          fullCode: p.name, // use name as fullCode for simple case
          type: 'project',
          tasks: p.tasks || []
        };
        window.firebaseSync.saveItem(item);
      } catch (e) { /* ignore */ }
    });
  }
}

// Load activities from localStorage
function loadActivities() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '{}');
  } catch {
    return {};
  }
}

// Save activities to localStorage
function saveActivitiesLocal(activities) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

// Add an activity (time/meeting/note) for a project
function addActivity(projectName, type, data) {
  const activities = loadActivities();
  if (!activities[projectName]) {
    activities[projectName] = [];
  }
  
  const activity = {
    id: Date.now().toString(),
    type,
    projectFullCode: projectName,
    timestamp: new Date().toISOString(),
    ...data
  };
  
  activities[projectName].push(activity);
  saveActivitiesLocal(activities);
  
  // Sync to Firestore if available
  if (window.firebaseSync && typeof window.firebaseSync.saveActivity === 'function') {
    try {
      window.firebaseSync.saveActivity(activity);
    } catch (e) { /* ignore */ }
  }
  
  return activity;
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
  // Make project title clickable to open activity panel
  title.addEventListener('click', () => openActivityPanel(p.name, idx));
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

// Activity Panel Functions
function openActivityPanel(projectName, projectIndex) {
  currentSelectedProject = { name: projectName, index: projectIndex };
  
  const panel = document.getElementById('activity-panel');
  const projectNameSpan = document.getElementById('activity-project-name');
  
  if (!panel || !projectNameSpan) return;
  
  projectNameSpan.textContent = projectName;
  panel.style.display = 'block';
  
  // Switch to the first tab
  switchActivityTab('time');
  
  // Load activities for this project
  renderActivities(projectName);
  
  // Subscribe to remote activity updates if available
  if (window.firebaseSync && typeof window.firebaseSync.subscribeActivities === 'function') {
    try {
      window.firebaseSync.subscribeActivities(projectName, (remoteActivities) => {
        // Merge remote activities with local
        mergeRemoteActivities(projectName, remoteActivities);
        renderActivities(projectName);
      });
    } catch (e) { /* ignore */ }
  }
}

function closeActivityPanel() {
  const panel = document.getElementById('activity-panel');
  if (panel) panel.style.display = 'none';
  currentSelectedProject = null;
}

function switchActivityTab(tabName) {
  currentActivityTab = tabName;
  
  // Update tab buttons
  document.querySelectorAll('.activity-tab').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Show/hide content
  document.getElementById('time-tab-content').style.display = tabName === 'time' ? 'block' : 'none';
  document.getElementById('meetings-tab-content').style.display = tabName === 'meetings' ? 'block' : 'none';
  document.getElementById('notes-tab-content').style.display = tabName === 'notes' ? 'block' : 'none';
}

function mergeRemoteActivities(projectName, remoteActivities) {
  // Simple last-write-wins merge strategy
  // NOTE: This completely replaces local activities with remote ones.
  // In a production app, you'd want a more sophisticated merge that preserves
  // local changes made while offline or uses timestamps to resolve conflicts.
  const activities = loadActivities();
  activities[projectName] = remoteActivities || [];
  saveActivitiesLocal(activities);
}

function renderActivities(projectName) {
  const activities = loadActivities();
  const projectActivities = activities[projectName] || [];
  
  // Render time entries
  const timeList = document.getElementById('time-entries-list');
  if (timeList) {
    timeList.innerHTML = '';
    const timeEntries = projectActivities.filter(a => a.type === 'time');
    if (timeEntries.length === 0) {
      timeList.innerHTML = '<li>No time entries yet.</li>';
    } else {
      timeEntries.forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${entry.hours} hours</strong> - ${entry.description}<br><em>${new Date(entry.timestamp).toLocaleString()}</em>`;
        timeList.appendChild(li);
      });
    }
  }
  
  // Render meeting notes
  const meetingsList = document.getElementById('meeting-notes-list');
  if (meetingsList) {
    meetingsList.innerHTML = '';
    const meetings = projectActivities.filter(a => a.type === 'meeting');
    if (meetings.length === 0) {
      meetingsList.innerHTML = '<li>No meeting notes yet.</li>';
    } else {
      meetings.forEach(meeting => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${meeting.title}</strong><br>${meeting.notes}<br><em>${new Date(meeting.timestamp).toLocaleString()}</em>`;
        meetingsList.appendChild(li);
      });
    }
  }
  
  // Render project notes
  const notesList = document.getElementById('project-notes-list');
  if (notesList) {
    notesList.innerHTML = '';
    const notes = projectActivities.filter(a => a.type === 'note');
    if (notes.length === 0) {
      notesList.innerHTML = '<li>No project notes yet.</li>';
    } else {
      notes.forEach(note => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>${note.title}</strong><br>${note.content}<br><em>${new Date(note.timestamp).toLocaleString()}</em>`;
        notesList.appendChild(li);
      });
    }
  }
}

function setupActivityPanel() {
  // Close button
  const closeBtn = document.getElementById('close-activity-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeActivityPanel);
  }
  
  // Tab switching
  document.querySelectorAll('.activity-tab').forEach(btn => {
    btn.addEventListener('click', () => switchActivityTab(btn.dataset.tab));
  });
  
  // Time entry form
  const timeForm = document.getElementById('add-time-entry-form');
  if (timeForm) {
    timeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentSelectedProject) return;
      
      const hours = document.getElementById('time-hours').value;
      const description = document.getElementById('time-description').value;
      
      addActivity(currentSelectedProject.name, 'time', { hours, description });
      renderActivities(currentSelectedProject.name);
      
      // Reset form
      timeForm.reset();
    });
  }
  
  // Meeting note form
  const meetingForm = document.getElementById('add-meeting-note-form');
  if (meetingForm) {
    meetingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentSelectedProject) return;
      
      const title = document.getElementById('meeting-title').value;
      const notes = document.getElementById('meeting-notes').value;
      
      addActivity(currentSelectedProject.name, 'meeting', { title, notes });
      renderActivities(currentSelectedProject.name);
      
      // Reset form
      meetingForm.reset();
    });
  }
  
  // Project note form
  const noteForm = document.getElementById('add-project-note-form');
  if (noteForm) {
    noteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentSelectedProject) return;
      
      const title = document.getElementById('note-title').value;
      const content = document.getElementById('note-content').value;
      
      addActivity(currentSelectedProject.name, 'note', { title, content });
      renderActivities(currentSelectedProject.name);
      
      // Reset form
      noteForm.reset();
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  renderProjects();
  setupAuthUI();
  setupActivityPanel();

  // If firebaseSync supports subscribe to remote updates, use it to update local UI.
  if (window.firebaseSync && typeof window.firebaseSync.subscribeItems === 'function') {
    window.firebaseSync.subscribeItems((remoteItems) => {
      if (!remoteItems) return;
      // Convert remote items back to projects format and merge
      try {
        const projects = remoteItems.filter(item => item.type === 'project').map(item => ({
          name: item.name,
          tasks: item.tasks || []
        }));
        if (projects.length > 0) {
          saveProjectsLocal(projects);
          renderProjects();
        }
      } catch (e) { /* ignore */ }
    });
  }
});
