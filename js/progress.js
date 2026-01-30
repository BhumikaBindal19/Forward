// Progress Page JavaScript - Firebase Integration

// Global State
let currentProject = null;
let projectSteps = [];
let unsubscribeSteps = null;
let unsubscribeGigs = null;

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to initialize
    setTimeout(initProgress, 200);
});

async function initProgress() {
    if (!window.ForwardFirebase) {
        console.error('ForwardFirebase not found');
        return;
    }

    window.ForwardFirebase.initializeFirebase();

    // Check auth and redirect if not logged in
    window.ForwardFirebase.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        // Check onboarding status
        const redirectPath = await window.ForwardFirebase.checkOnboardingStatus(user);
        if (redirectPath && redirectPath !== 'progress.html') {
            window.location.href = redirectPath;
            return;
        }

        // Initialize UI before loading data
        initializeUI(user);

        // Load data
        await loadUserProject(user.uid);
        listenToMyGigs(user.uid);
    });
}

function initializeUI(user) {
    // Create Gig Modal
    const gigModal = document.getElementById('gigModal');
    const createBtn = document.getElementById('createGigBtn');
    const closeBtns = document.querySelectorAll('.close-modal');
    const gigForm = document.getElementById('gigForm');

    createBtn.addEventListener('click', () => gigModal.classList.add('active'));

    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        });
    });

    // Gig Form Submission
    gigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gigData = {
            ownerId: user.uid,
            title: document.getElementById('gigTitle').value,
            description: document.getElementById('gigDesc').value,
            budget: document.getElementById('gigBudget').value,
            deadline: document.getElementById('gigDeadline').value,
            requiredSkills: document.getElementById('gigSkills').value.split(',').map(s => s.trim()),
            status: 'open'
        };

        const result = await window.ForwardFirebase.createGig(gigData);
        if (result.success) {
            showNotification('Micro-gig posted successfully!', 'success');
            gigModal.classList.remove('active');
            gigForm.reset();
        } else {
            showNotification('Error creating gig', 'error');
        }
    });

    // Roadmap Button
    document.getElementById('viewRoadmapBtn').addEventListener('click', () => {
        showNotification('Opening your Income-First Roadmap...', 'info');
        // In a real app, this would scroll to a specific section or open a dedicated view
        document.querySelector('.tasks-section').scrollIntoView({ behavior: 'smooth' });
    });
}

async function loadUserProject(userId) {
    try {
        let projectId = localStorage.getItem('currentProjectId');

        if (!projectId) {
            const result = await window.ForwardFirebase.getUserProjects(userId);
            if (result.success && result.projects.length > 0) {
                projectId = result.projects[0].id;
                localStorage.setItem('currentProjectId', projectId);
            } else {
                console.log('No project found for user');
                window.location.href = 'onboarding.html';
                return;
            }
        }

        listenToSteps(projectId);
    } catch (error) {
        console.error('Error in loadUserProject:', error);
    }
}

function listenToSteps(projectId) {
    if (unsubscribeSteps) unsubscribeSteps();
    unsubscribeSteps = window.ForwardFirebase.listenToProjectSteps(projectId, (steps) => {
        projectSteps = steps;
        renderSteps(steps);
        updateProgressFromSteps(steps);
    });
}

function renderSteps(steps) {
    const tasksList = document.getElementById('tasksList');
    if (!tasksList) return;

    tasksList.innerHTML = '';
    steps.forEach(step => {
        const item = document.createElement('div');
        item.className = `task-item ${step.status === 'completed' ? 'completed' : step.status === 'in-progress' ? 'in-progress' : ''}`;

        item.innerHTML = `
            <div class="task-checkbox ${step.status === 'completed' ? 'checked' : ''}">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-content">
                <h4 class="task-name">${step.title}</h4>
                <p class="task-description">${step.description}</p>
                <button class="btn-ask-ai" onclick="event.stopPropagation(); askAI('${step.id}')">
                    <i class="fas fa-magic"></i> Help with this step
                </button>
            </div>
            ${step.delegationSuggested ? '<span class="task-status-badge">DELEGATION SUGGESTED</span>' : ''}
        `;

        item.addEventListener('click', () => handleStepToggle(step));
        tasksList.appendChild(item);
    });
}

function listenToMyGigs(userId) {
    if (unsubscribeGigs) unsubscribeGigs();
    const gigsSection = document.getElementById('founderGigsSection');
    const gigsList = document.getElementById('founderGigsList');

    unsubscribeGigs = window.ForwardFirebase.listenToMyGigs(userId, (gigs) => {
        gigsSection.style.display = 'block';
        gigsList.innerHTML = '';

        if (gigs.length === 0) {
            gigsList.innerHTML = `
                <div class="empty-state">
                    <p>You haven't posted any micro-gigs yet. Delegate tasks to move faster!</p>
                </div>
            `;
            return;
        }

        gigs.forEach(gig => {
            const item = document.createElement('div');
            item.className = 'gig-item';
            item.innerHTML = `
                <div class="gig-info">
                    <h4>${gig.title}</h4>
                    <div class="gig-meta">
                        <span><i class="fas fa-coins"></i> ₹${gig.budget}</span>
                        <span><i class="fas fa-calendar"></i> ${gig.deadline}</span>
                        <span><i class="fas fa-users"></i> ${gig.applicantCount || 0} applicants</span>
                    </div>
                </div>
                <div class="applicant-badge" onclick="viewApplicants('${gig.id}')">
                    VIEW APPLICANTS
                </div>
            `;
            gigsList.appendChild(item);
        });
    });
}

async function viewApplicants(gigId) {
    const modal = document.getElementById('applicantsModal');
    const list = document.getElementById('applicantsList');
    modal.classList.add('active');
    list.innerHTML = '<div class="loading-state">Fetching interested collaborators...</div>';

    const result = await window.ForwardFirebase.getGigApplicants(gigId);
    if (result.success) {
        list.innerHTML = '';
        if (result.applicants.length === 0) {
            list.innerHTML = '<p>No applicants yet. We are sharing your gig with skilled collaborators!</p>';
        } else {
            result.applicants.forEach(app => {
                const div = document.createElement('div');
                div.className = 'applicant-item';
                div.innerHTML = `
                    <div class="applicant-header">
                        <div class="applicant-info">
                            <h5>${app.profile?.username || 'Collaborator'}</h5>
                            <span class="applicant-location"><i class="fas fa-map-marker-alt"></i> ${app.profile?.location || 'Remote'}</span>
                        </div>
                        <span class="match-badge">Skill Match</span>
                    </div>
                    <div class="applicant-details">
                        <p><strong>Experience:</strong> ${app.profile?.bio || 'No bio provided'}</p>
                        <p><strong>Skills:</strong> ${app.profile?.skills?.join(', ') || 'Generalist'}</p>
                    </div>
                    <div class="applicant-actions">
                        <a href="mailto:${app.profile?.email}" class="btn btn-outline btn-sm">Contact</a>
                        <button class="btn btn-primary btn-sm">Hire for Gig</button>
                    </div>
                `;
                list.appendChild(div);
            });
        }
    }
}

async function handleStepToggle(step) {
    const nextStates = { 'pending': 'in-progress', 'in-progress': 'completed', 'completed': 'pending' };
    const newStatus = nextStates[step.status] || 'pending';
    const projectId = localStorage.getItem('currentProjectId');
    await window.ForwardFirebase.updateStepStatus(projectId, step.id, newStatus);
}

function updateProgressFromSteps(steps) {
    const completed = steps.filter(s => s.status === 'completed').length;
    const percentage = steps.length > 0 ? Math.round((completed / steps.length) * 100) : 0;

    const percentageEl = document.querySelector('.completion-percentage');
    const progressBar = document.querySelector('.progress-bar');

    if (percentageEl) percentageEl.textContent = `${percentage}%`;
    if (progressBar) progressBar.style.width = `${percentage}%`;

    document.getElementById('completed-count').textContent = completed;
    document.getElementById('total-count').textContent = steps.length;
}

async function askAI(stepId) {
    const step = projectSteps.find(s => s.id === stepId);
    showNotification(`AI Advisor: Thinking about "${step.title}"...`, 'info');
    // Future: Open chat panel or call AI service
    setTimeout(() => {
        alert(`AI Advice for "${step.title}":\n\nTo complete this successfully, focus on ${step.description.toLowerCase()}. Would you like me to generate a template for this?`);
    }, 1500);
}

// Attach global function for inline onclick
window.viewApplicants = viewApplicants;
window.askAI = askAI;

