
const form = document.querySelector('#project-form');
const nameInput = document.querySelector('#name');
const statusInput = document.querySelector('#status');
const projectList = document.querySelector('#project-list');
const emptyState = document.querySelector('#empty-state');

// Store projects in memory
const projects = [];

// Generate a unique ID for each project
function generateId() {
    return crypto.randomUUID();
}

// Display all projects
function renderProjects() {
    // Clear the existing list
    projectList.replaceChildren();

    // Update the empty-state message if it exists
    if (emptyState) {
        emptyState.hidden = projects.length > 0;
    }

    // Display every project
    projects.forEach(project => {
        const li = document.createElement('li');

        const projectName = document.createElement('span');
        projectName.textContent = project.name;

        const projectStatus = document.createElement('span');
        projectStatus.textContent = ` - ${project.status}`;

        li.appendChild(projectName);
        li.appendChild(projectStatus);

        projectList.appendChild(li);
    });
}

// Handle form submission
form.addEventListener('submit', event => {
    // Prevent the browser from reloading the page
    event.preventDefault();

    // Read the current form values
    const name = nameInput.value.trim();
    const status = statusInput.value;

    // Reject an empty project name
    if (name === '') {
        nameInput.focus();
        return;
    }

    // Create a new project
    const project = {
        id: generateId(),
        name: name,
        status: status
    };

    // Add the project to the array
    projects.push(project);

    // Display the updated project list
    renderProjects();

    // Clear the name field for the next project
    nameInput.value = '';
    nameInput.focus();
});

// Display the initial empty state
renderProjects();
