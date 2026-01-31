// Collaborator Onboarding JavaScript

// Global State
let currentQuestionIndex = 0;
let answers = {};
const questions = [
    {
        id: 'skills',
        phase: 'PHASE 1: EXPERTISE',
        title: 'Which skills do you offer?',
        subtitle: 'Select all that apply to match you with the right micro-gigs.',
        type: 'options',
        options: [
            { text: 'Logo Design', value: 'logo', icon: 'fa-pen-nib' },
            { text: 'Social Media', value: 'social', icon: 'fa-share-alt' },
            { text: 'Writing', value: 'writing', icon: 'fa-feather' },
            { text: 'Web Styling', value: 'web', icon: 'fa-code' },
            { text: 'Data Entry', value: 'data', icon: 'fa-table' },
            { text: 'Translation', value: 'translation', icon: 'fa-language' }
        ]
    },
    {
        id: 'experience',
        phase: 'PHASE 2: PROFILE',
        title: 'Tell us about your experience',
        subtitle: 'Briefly describe your previous work or specialties.',
        type: 'text',
        placeholder: 'e.g., I have 2 years of logo design experience...'
    },
    {
        id: 'contact',
        phase: 'PHASE 3: CONNECT',
        title: 'How can owners reach you?',
        subtitle: 'Provide your professional contact and portfolio details.',
        type: 'contact'
    },
    {
        id: 'availability',
        phase: 'PHASE 4: COMMITMENT',
        title: 'What is your availability?',
        subtitle: 'When can you typically help with tasks?',
        type: 'options',
        options: [
            { text: 'Daily (2-4h)', value: 'daily', icon: 'fa-sun' },
            { text: 'Weekends', value: 'weekends', icon: 'fa-calendar-plus' },
            { text: 'Evenings', value: 'evenings', icon: 'fa-moon' },
            { text: 'On-demand', value: 'flexible', icon: 'fa-bolt' }
        ]
    }
];

// DOM Elements
const questionCard = document.getElementById('questionCard');
const phaseName = document.getElementById('phaseName');
const questionCounter = document.getElementById('questionCounter');
const questionTitle = document.getElementById('questionTitle');
const questionSubtitle = document.getElementById('questionSubtitle');
const optionsWrapper = document.getElementById('optionsWrapper');
const textInputWrapper = document.getElementById('textInputWrapper');
const answerInput = document.getElementById('answerInput');
const prevBtn = document.getElementById('prevBtn');
const continueBtn = document.getElementById('continueBtn');
const progressDots = document.querySelectorAll('#progressDots .dot');
const successModal = document.getElementById('successModal');
const finishBtn = document.getElementById('finishBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (window.ForwardFirebase && window.ForwardFirebase.initializeFirebase) {
        window.ForwardFirebase.initializeFirebase();
        window.ForwardFirebase.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'auth.html';
                return;
            }

            // Check if user should be here
            const redirectPath = await window.ForwardFirebase.checkOnboardingStatus(user);
            if (redirectPath && !redirectPath.includes('onboarding-collaborator.html')) {
                window.location.href = redirectPath;
                return;
            }

            // If we are here, load the UI
            loadQuestion(0);
            initializeInteractions();
        });
    } else {
        // Fallback or demo mode
        loadQuestion(0);
        initializeInteractions();
    }
});

function initializeInteractions() {
    continueBtn.addEventListener('click', handleContinue);
    prevBtn.addEventListener('click', goToPrevious);
    finishBtn.addEventListener('click', () => {
        window.location.href = 'gigboard.html';
    });

    answerInput.addEventListener('input', () => {
        continueBtn.disabled = !answerInput.value.trim();
    });

    document.querySelector('.save-exit-btn').addEventListener('click', () => {
        if (confirm('Exit onboarding? Your progress will be saved.')) {
            window.location.href = '../index.html';
        }
    });
}

function loadQuestion(index) {
    const question = questions[index];
    questionTitle.textContent = question.title;
    questionSubtitle.textContent = question.subtitle;
    phaseName.textContent = question.phase;
    questionCounter.textContent = `QUESTION ${index + 1} OF ${questions.length}`;

    updateProgressDots(index);

    if (question.type === 'options') {
        textInputWrapper.style.display = 'none';
        optionsWrapper.style.display = 'grid';
        renderOptions(question);
    } else if (question.type === 'contact') {
        optionsWrapper.style.display = 'none';
        textInputWrapper.style.display = 'block';
        answerInput.style.display = 'none';
        document.getElementById('contactFields').style.display = 'grid';

        document.getElementById('phoneInput').value = answers.phone || '';
        document.getElementById('locationInput').value = answers.location || '';
        document.getElementById('portfolioInput').value = answers.portfolio || '';

        checkContactValidity();
        // } else {
        //     optionsWrapper.style.display = 'none';
        //     textInputWrapper.style.display = 'block';
        //     answerInput.style.display = 'block';
        //     document.getElementById('contactFields').style.display = 'none';
        //     answerInput.value = answers[question.id] || '';
        //     continueBtn.disabled = !answerInput.value.trim();
        // }
        // AFTER (The fixed section)
    } else {
        // Hide options and show the text area
        optionsWrapper.style.display = 'none';
        textInputWrapper.style.display = 'block';
        answerInput.style.display = 'block';
        document.getElementById('contactFields').style.display = 'none';

        // Set the value from saved answers (if any)
        const savedValue = answers[question.id] || '';
        answerInput.value = savedValue;

        // CRITICAL FIX: Explicitly enable/disable the button based on text presence
        if (savedValue.trim().length > 0) {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1'; // Ensure it looks clickable
        } else {
            continueBtn.disabled = true;
            continueBtn.style.opacity = '0.5'; // Visual cue that it's locked
        }
    }

    prevBtn.disabled = index === 0;
}

function renderOptions(question) {
    optionsWrapper.innerHTML = '';
    question.options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'option-card';
        if (answers[question.id] === opt.value) div.classList.add('selected');

        div.innerHTML = `
            <i class="fas ${opt.icon}"></i>
            <span>${opt.text}</span>
        `;

        div.addEventListener('click', () => {
            answers[question.id] = opt.value;
            handleContinue();
        });
        optionsWrapper.appendChild(div);
    });
}

function handleContinue() {
    const question = questions[currentQuestionIndex];
    if (question.type === 'text') {
        answers[question.id] = answerInput.value.trim();
    } else if (question.type === 'contact') {
        answers.phone = document.getElementById('phoneInput').value.trim();
        answers.location = document.getElementById('locationInput').value.trim();
        answers.portfolio = document.getElementById('portfolioInput').value.trim();
    }

    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        completeOnboarding();
    }
}

function checkContactValidity() {
    const p = document.getElementById('phoneInput').value.trim();
    const l = document.getElementById('locationInput').value.trim();
    continueBtn.disabled = !(p && l);
}

// Add event listeners for contact fields
document.addEventListener('input', (e) => {
    if (e.target.classList.contains('onboarding-input')) {
        checkContactValidity();
    }
});

function goToPrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

function updateProgressDots(index) {
    progressDots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
        dot.classList.toggle('completed', idx < index);
    });
}

async function completeOnboarding() {
    document.getElementById('loadingOverlay').style.display = 'flex';

    if (window.ForwardFirebase) {
        window.ForwardFirebase.initializeFirebase();
        window.ForwardFirebase.onAuthStateChanged(async (user) => {
            if (user) {
                const profileData = {
                    skills: [answers.skills],
                    bio: answers.experience,
                    phone: answers.phone,
                    location: answers.location,
                    portfolio: answers.portfolio,
                    availability: answers.availability,
                    onboardingCompleted: true,
                    role: 'collaborator'
                };

                await window.ForwardFirebase.updateUserDocument(user.uid, profileData);
                document.getElementById('loadingOverlay').style.display = 'none';
                successModal.style.display = 'flex';
            }
        });
    }
}
