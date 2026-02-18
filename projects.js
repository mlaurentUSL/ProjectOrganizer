// projects.js
// Simple project add/load using localStorage.
// Drop this file next to projects.html

const STORAGE_KEY = 'projectOrganizer.projects';

function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function renderProjects() {
  const list = document.getElementById('project-list');
  list.innerHTML = ''; // clear current list

  const projects = loadProjects();
  if (projects.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No projects yet.';
    list.appendChild(li);
    return;
  }

  projects.forEach((p, idx) => {
    const li = document.createElement('li');

    const title = document.createElement('strong');
    title.textContent = p.name;
    li.appendChild(title);

    // optional: show tasks if present
    if (p.tasks && p.tasks.length) {
      const span = document.createElement('span');
      span.textContent = ' - ' + p.tasks.join(', ');
      li.appendChild(span);
    }

    // delete button
    const del = document.createElement('button');
    del.textContent = 'Delete';
    del.style.marginLeft = '10px';
    del.addEventListener('click', () => {
      const projects = loadProjects();
      projects.splice(idx, 1);
      saveProjects(projects);
      renderProjects();
    });
    li.appendChild(del);

    list.appendChild(li);
  });
}

function setupForm() {
  const form = document.getElementById('add-project-form');
  const input = document.getElementById('project-name');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;

    const projects = loadProjects();
    projects.push({ name, tasks: [] }); // simple structure
    saveProjects(projects);
    input.value = '';
    renderProjects();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupForm();
  renderProjects();
});
