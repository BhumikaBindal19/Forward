// Onboarding Page JavaScript

// Questions Data
const questions = [
    {
        id: 1,
        phase: "Vision Phase",
        title: "What are you trying to build — in one sentence?",
        subtitle: 'Example: "I want to help local home bakers get regular customers."',
        type: "text",
        placeholder: "I want to build a world where..."
    },
    {
        id: 2,
        phase: "Market Clarity",
        title: "Who exactly is this for, and what problem do they face often?",
        subtitle: "Be specific — age, role, situation, or daily struggle.",
        type: "text",
        placeholder: "My target users are..."
    },
    {
        id: 3,
        phase: "Resource Assessment",
        title: "What do you already have that can help you build this?",
        subtitle: "Skills, experience, tools, network — anything counts.",
        type: "text",
        placeholder: "I have..."
    },
    {
        id: 4,
        phase: "Time Commitment",
        title: "How much time and energy can you realistically give this each week?",
        subtitle: "Choose the option that best describes your availability.",
        type: "options",
        options: [
            { icon: "fa-clock", text: "Less than 5 hours", value: "<5hrs" },
            { icon: "fa-business-time", text: "5–10 hours", value: "5-10hrs" },
            { icon: "fa-calendar-week", text: "10–20 hours", value: "10-20hrs" },
            { icon: "fa-rocket", text: "Full-time (20+ hours)", value: "fulltime" }
        ]
    },
    {
        id: 5,
        phase: "Validation Stage",
        title: "Have you tested this idea in any form yet?",
        subtitle: "Help us understand where you are in your journey.",
        type: "options",
        options: [
            { icon: "fa-seedling", text: "Not yet", value: "not_yet" },
            { icon: "fa-comments", text: "Talked to people", value: "talked" },
            { icon: "fa-hammer", text: "Built something small", value: "built_small" },
            { icon: "fa-dollar-sign", text: "People have shown interest / paid", value: "validated" }
        ]
    },
    {
        id: 6,
        phase: "Blocker Identification",
        title: "What's the biggest thing stopping you right now?",
        subtitle: "Identifying your primary blocker helps us prioritize your roadmap.",
        type: "options",
        options: [
            { icon: "fa-compass", text: "Clarity on next steps", value: "clarity" },
            { icon: "fa-tools", text: "Skills or knowledge", value: "skills" },
            { icon: "fa-coins", text: "Money or resources", value: "money" },
            { icon: "fa-heart", text: "Confidence", value: "confidence" },
            { icon: "fa-clock", text: "Time", value: "time" },
            { icon: "fa-question-circle", text: "Something else", value: "other" }
        ]
    },
    {
        id: 7,
        phase: "Goal Setting",
        title: "What would 'progress' look like for you in the next 30 days?",
        subtitle: "First user, first ₹ earned, MVP built, confidence, consistency, etc.",
        type: "text",
        placeholder: "In 30 days, success would mean..."
    }
];

// State Management
let currentQuestionIndex = 0;
let answers = {};

// DOM Elements
const phaseName = document.getElementById('phaseName');
const questionTitle = document.getElementById('questionTitle');
const questionSubtitle = document.getElementById('questionSubtitle');
const questionCard = document.getElementById('questionCard');
const textInputWrapper = document.getElementById('textInputWrapper');
const optionsWrapper = document.getElementById('optionsWrapper');
const answerInput = document.getElementById('answerInput');
const continueBtn = document.getElementById('continueBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const questionCounter = document.getElementById('questionCounter');
const progressDots = document.querySelectorAll('.progress-dot');
const successModal = document.getElementById('successModal');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadQuestion(0);
    setupEventListeners();
    autoResizeTextarea();
});

// Setup Event Listeners
function setupEventListeners() {
    // Continue button
    continueBtn.addEventListener('click', handleContinue);
    
    // Previous button
    prevBtn.addEventListener('click', goToPrevious);
    
    // Enter key to submit
    answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!continueBtn.disabled) {
                handleContinue();
            }
        }
    });
    
    // Enable continue button when user types
    answerInput.addEventListener('input', () => {
        const hasText = answerInput.value.trim().length > 0;
        continueBtn.disabled = !hasText;
        
        // Auto-save
        if (hasText) {
            saveAnswer();
        }
    });
    
    // Exit button
    document.querySelector('.save-exit-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to exit? Your progress will be saved.')) {
            window.location.href = 'index.html';
        }
    });
}

// Load Question
function loadQuestion(index) {
    const question = questions[index];
    
    // Add fade out animation to current content
    questionCard.classList.add('fade-out');
    
    setTimeout(() => {
        // Update content
        phaseName.textContent = question.phase;
        questionTitle.textContent = question.title;
        questionSubtitle.textContent = question.subtitle;
        
        // Update question counter
        questionCounter.textContent = `QUESTION ${index + 1} OF ${questions.length}`;
        
        // Update progress dots
        updateProgressDots(index);
        
        // Show appropriate input type
        if (question.type === 'text') {
            textInputWrapper.style.display = 'block';
            optionsWrapper.style.display = 'none';
            answerInput.placeholder = question.placeholder;
            answerInput.value = answers[question.id] || '';
            answerInput.focus();
            
            // Enable/disable continue button
            continueBtn.disabled = !answerInput.value.trim();
        } else if (question.type === 'options') {
            textInputWrapper.style.display = 'none';
            optionsWrapper.style.display = 'grid';
            renderOptions(question.options, question.id);
        }
        
        // Update navigation buttons
        prevBtn.disabled = index === 0;
        
        // Remove fade out and add slide in
        questionCard.classList.remove('fade-out');
        questionCard.classList.add('slide-in-right');
        
        setTimeout(() => {
            questionCard.classList.remove('slide-in-right');
        }, 500);
    }, 300);
}

// Render Options
function renderOptions(options, questionId) {
    optionsWrapper.innerHTML = '';
    
    options.forEach((option, idx) => {
        const optionCard = document.createElement('div');
        optionCard.className = 'option-card';
        optionCard.innerHTML = `
            <i class="fas ${option.icon}"></i>
            <span>${option.text}</span>
        `;
        
        // Check if this option was previously selected
        if (answers[questionId] === option.value) {
            optionCard.classList.add('selected');
        }
        
        optionCard.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.option-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            optionCard.classList.add('selected');
            
            // Save answer
            answers[questionId] = option.value;
            saveToLocalStorage();
            
            // Auto-advance after short delay
            setTimeout(() => {
                handleContinue();
            }, 400);
        });
        
        // Stagger animation
        optionCard.style.animation = `fadeInUp 0.4s ease-out ${idx * 0.1}s backwards`;
        
        optionsWrapper.appendChild(optionCard);
    });
}

// Handle Continue
function handleContinue() {
    const question = questions[currentQuestionIndex];
    
    // Save text answer
    if (question.type === 'text') {
        const answer = answerInput.value.trim();
        if (!answer) return;
        
        answers[question.id] = answer;
        saveToLocalStorage();
    }
    
    // Move to next question or complete
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
    } else {
        completeOnboarding();
    }
}

// Go to Previous
function goToPrevious() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
    }
}

// Update Progress Dots
function updateProgressDots(index) {
    progressDots.forEach((dot, idx) => {
        dot.classList.remove('active', 'completed');
        
        if (idx < index) {
            dot.classList.add('completed');
        } else if (idx === index) {
            dot.classList.add('active');
        }
    });
}

// Save Answer to LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('onboardingAnswers', JSON.stringify(answers));
    console.log('Answers saved:', answers);
}

// Load Answers from LocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('onboardingAnswers');
    if (saved) {
        answers = JSON.parse(saved);
    }
}

// Complete Onboarding
function completeOnboarding() {
    // Mark all dots as completed
    progressDots.forEach(dot => {
        dot.classList.add('completed');
        dot.classList.remove('active');
    });
    
    // Show success modal
    successModal.style.display = 'flex';
    
    // Simulate roadmap generation
    setTimeout(() => {
        console.log('Final Answers:', answers);
        
        // Redirect to roadmap page
        // window.location.href = 'roadmap.html';
        
        // For demo, just show alert
        alert('Roadmap generated! (In production, this would redirect to your personalized roadmap)');
        successModal.style.display = 'none';
    }, 3000);
}

// Auto-resize Textarea
function autoResizeTextarea() {
    answerInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });
}

// Save Answer (for auto-save indicator)
function saveAnswer() {
    const question = questions[currentQuestionIndex];
    answers[question.id] = answerInput.value.trim();
    saveToLocalStorage();
}

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    // Don't trigger if user is typing
    if (document.activeElement === answerInput) return;
    
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
        goToPrevious();
    } else if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
        const question = questions[currentQuestionIndex];
        if (answers[question.id]) {
            handleContinue();
        }
    }
});

// Progress Dot Click Navigation
progressDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        // Only allow going back to completed questions
        if (index <= currentQuestionIndex) {
            currentQuestionIndex = index;
            loadQuestion(currentQuestionIndex);
        }
    });
});

// Load saved answers on page load
loadFromLocalStorage();

// Prevent accidental page refresh
window.addEventListener('beforeunload', (e) => {
    if (Object.keys(answers).length > 0 && currentQuestionIndex < questions.length - 1) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Console log for debugging
console.log('Onboarding initialized with', questions.length, 'questions');