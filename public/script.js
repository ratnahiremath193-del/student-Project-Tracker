

const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');
const saveButton = document.querySelector('#save-button');
const cancelButton = document.querySelector('#cancel-button');
const message = document.querySelector('#message');

// Exact key used to store projects
const STORAGE_KEY = 'workshop-projects-v1';

// Store projects in memory
const projects = [];

// Track the project currently being edited
let editingId = null;

// Prevent overwriting data that could not be read safely
let canPersist = true;

// Generate a unique ID for each new project
function generateId() {
    return crypto.randomUUID();
}

// Display a message when needed
function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// Check that stored data contains valid project records
function isValidProjects(data) {
    return Array.isArray(data) &&
        data.every(project =>
            project !== null &&
            typeof project === 'object' &&
            !Array.isArray(project) &&
            typeof project.id === 'string' &&
            project.id.trim() !== '' &&
            typeof project.name === 'string' &&
            project.name.trim() !== '' &&
            typeof project.status === 'string'
        );
}

// Load saved projects when the page starts
function loadProjects() {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);

        // No saved data: start with an empty array
        if (storedData === null) {
            return;
        }

        // Convert stored text back into JavaScript data
        const parsedData = JSON.parse(storedData);

        // Do not use or overwrite malformed data
        if (!isValidProjects(parsedData)) {
            canPersist = false;
            showMessage(
                'Saved project data is invalid. ' +
                'Existing stored data has not been overwritten.'
            );
            return;
        }

        // Restore the existing projects
        projects.push(...parsedData);
    } catch (error) {
        canPersist = false;
        showMessage(
            'Could not read saved projects. ' +
            'Stored data has not been overwritten.'
        );
    }
}

// Save the current projects array
function saveProjects() {
    if (!canPersist) {
        showMessage(
            'Changes could not be saved. ' +
            'The existing stored data could not be loaded safely.'
        );
        return false;
    }

    try {
        // Convert the array into text and store it
        const storedData = JSON.stringify(projects);
        localStorage.setItem(STORAGE_KEY, storedData);
        showMessage('');
        return true;
    } catch (error) {
        showMessage(
            'Changes could not be saved. ' +
            'Please check your browser storage settings.'
        );
        return false;
    }
}

// Return the form to Add mode
function resetForm() {
    editingId = null;
    form.reset();
    saveButton.textContent = 'Save Project';
    cancelButton.hidden = true;
}

// Display all projects
function renderProjects() {
    projectList.replaceChildren();

    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }

    projects.forEach(project => {
        const li = document.createElement('li');

        const projectName = document.createElement('span');
        projectName.textContent = project.name;

        const projectStatus = document.createElement('span');
        projectStatus.textContent = ` - ${project.status} `;

        // Edit button
        const editButton = document.createElement('button');
        editButton.type = 'button';
        editButton.textContent = 'Edit';

        editButton.addEventListener('click', () => {
            const selectedProject = projects.find(
                item => item.id === project.id
            );

            if (!selectedProject) {
                return;
            }

            editingId = selectedProject.id;
            nameInput.value = selectedProject.name;
            statusInput.value = selectedProject.status;

            saveButton.textContent = 'Save changes';
            cancelButton.hidden = false;
            nameInput.focus();
            showMessage('');
        });

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.textContent = 'Delete';

        deleteButton.addEventListener('click', () => {
            const selectedProject = projects.find(
                item => item.id === project.id
            );

            if (!selectedProject) {
                return;
            }

            // Ask for confirmation before deleting
            const confirmed = window.confirm(
                `Are you sure you want to delete "${selectedProject.name}"?`
            );

            if (!confirmed) {
                return;
            }

            const index = projects.findIndex(
                item => item.id === selectedProject.id
            );

            if (index === -1) {
                return;
            }

            // Remove only the selected project
            projects.splice(index, 1);

            // Reset the form if its project was deleted
            if (editingId === selectedProject.id) {
                resetForm();
            }

            renderProjects();
            saveProjects();
        });

        li.appendChild(projectName);
        li.appendChild(projectStatus);
        li.appendChild(editButton);
        li.appendChild(deleteButton);

        projectList.appendChild(li);
    });
}

// Handle both Add and Edit
form.addEventListener('submit', event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const status = statusInput.value;

    // Reject an empty project name
    if (name === '') {
        nameInput.focus();
        showMessage('Please enter a project name.');
        return;
    }

    if (editingId === null) {
        // Add a new project
        projects.push({
            id: generateId(),
            name: name,
            status: status
        });
    } else {
        // Update the existing project without changing its ID
        const project = projects.find(
            item => item.id === editingId
        );

        if (!project) {
            resetForm();
            renderProjects();
            showMessage('The project could not be found.');
            return;
        }

        project.name = name;
        project.status = status;
    }

    // Update the list and save the changed collection
    renderProjects();
    saveProjects();
    resetForm();
});

// Cancel editing without changing saved records
cancelButton.addEventListener('click', () => {
    resetForm();
    showMessage('');
});

// Restore saved projects and display them on startup
loadProjects();
renderProjects();

