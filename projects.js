// When creating/updating local item:
saveProjectsLocal(projects); // existing local save
if (window.firebaseSync && typeof window.firebaseSync.saveItem === 'function') {
  // For each project convert to "item" docs (clients/projects/tasks..)
  // Example: for a project-level doc:
  const item = {
    type: 'project',
    clientNumber: '1234',
    clientName: 'ACME',
    projectNumber: '5678',
    projectName: 'Project Name',
    fullCode: '1234.5678',
    parentFullCode: '1234'
  };
  window.firebaseSync.saveItem(item);
}
