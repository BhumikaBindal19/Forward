// Auth Page JavaScript - Firebase Integration
// Toggle between Login and Signup with real Firebase authentication

// State Management
let isSignupMode = false;
let selectedRole = '';
let firebaseInitialized = false;

// DOM Elements
const authForm = document.getElementById('authForm');
const toggleLink = document.getElementById('toggleLink');
const toggleText = document.getElementById('toggleText');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitText = document.getElementById('submitText');
const headerBadge = document.getElementById('headerBadge');
const roleSelection = document.getElementById('roleSelection');
const termsGroup = document.getElementById('termsGroup');
const formContainer = document.querySelector('.form-container');

// Initialize Firebase when ready
document.addEventListener('DOMContentLoaded', () => {
    let attempts = 0;
    const maxAttempts = 20; // Try for 2 seconds

    const waitForFirebase = setInterval(() => {
        attempts++;
        if (window.ForwardFirebase && window.ForwardFirebase.initializeFirebase()) {
            clearInterval(waitForFirebase);
            firebaseInitialized = true;
            console.log('Firebase ready for auth');

            // Check if user is already logged in
            window.ForwardFirebase.onAuthStateChanged(user => {
                if (user) {
                    console.log('User already logged in:', user.email);
                    // Redirect to appropriate page based on role
                    redirectAfterAuth(user);
                }
            });
        } else if (attempts >= maxAttempts) {
            clearInterval(waitForFirebase);
            console.error('Firebase failed to initialize after multiple attempts. Check network connection.');
            // Optionally show a UI error message to the user
            const formContainer = document.querySelector('.form-container');
            if (formContainer) {
                const errorBanner = document.createElement('div');
                errorBanner.style.background = '#ffebee';
                errorBanner.style.color = '#c62828';
                errorBanner.style.padding = '10px';
                errorBanner.style.borderRadius = '4px';
                errorBanner.style.marginBottom = '15px';
                errorBanner.style.textAlign = 'center';
                errorBanner.textContent = 'Unable to connect to service. Please refresh the page.';
                formContainer.prepend(errorBanner);
            }
        }
    }, 100);
});

// Redirect after successful authentication
async function redirectAfterAuth(user) {
    try {
        console.log('Authenticating user:', user.uid);
        const redirectPath = await window.ForwardFirebase.checkOnboardingStatus(user);
        if (redirectPath) {
            console.log('Redirecting to:', redirectPath);
            window.location.href = redirectPath;
        } else {
            console.warn('No redirect path returned from checkOnboardingStatus on auth page.');
            // Fallback if something is weird, though checkOnboardingStatus covers auth.html
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Redirect error:', error);
        window.location.href = 'auth.html';
    }
}

// Toggle between Login and Signup
toggleLink.addEventListener('click', function (e) {
    e.preventDefault();
    toggleAuthMode();
});

function toggleAuthMode() {
    // Add transition effect
    formContainer.classList.add('transitioning');

    setTimeout(() => {
        isSignupMode = !isSignupMode;

        if (isSignupMode) {
            // Switch to Signup Mode
            formTitle.textContent = 'Create Your Account';
            formSubtitle.textContent = 'Join Forward and start your journey';
            submitText.textContent = 'Create Account';
            headerBadge.textContent = 'JOIN FORWARD';
            toggleText.innerHTML = 'Already have an account? <a href="#" class="link" id="toggleLink">Sign In</a>';

            // Show role selection and terms
            roleSelection.style.display = 'block';
            termsGroup.style.display = 'block';

            // Animate role cards in
            setTimeout(() => {
                roleSelection.style.opacity = '0';
                roleSelection.style.transform = 'translateY(20px)';
                roleSelection.style.transition = 'all 0.5s ease';
                setTimeout(() => {
                    roleSelection.style.opacity = '1';
                    roleSelection.style.transform = 'translateY(0)';
                }, 50);
            }, 100);

        } else {
            // Switch to Login Mode
            formTitle.textContent = 'Login to your Account';
            formSubtitle.textContent = 'Welcome back! Let\'s continue your journey';
            submitText.textContent = 'Login';
            headerBadge.textContent = 'WELCOME BACK';
            toggleText.innerHTML = 'New to Forward? <a href="#" class="link" id="toggleLink">Create an Account</a>';

            // Hide role selection and terms
            roleSelection.style.display = 'none';
            termsGroup.style.display = 'none';

            // Clear role selection
            document.querySelectorAll('.role-card').forEach(card => {
                card.classList.remove('selected');
            });
            selectedRole = '';
            document.getElementById('selectedRole').value = '';

            // Clear terms checkbox
            document.getElementById('terms').checked = false;
        }

        // Re-attach toggle listener
        const newToggleLink = document.getElementById('toggleLink');
        newToggleLink.addEventListener('click', function (e) {
            e.preventDefault();
            toggleAuthMode();
        });

        // Remove transition effect
        formContainer.classList.remove('transitioning');

        // Reset password strength indicator
        document.getElementById('passwordStrength').classList.remove('visible');

    }, 150);
}

// Role Selection
const roleCards = document.querySelectorAll('.role-card');

roleCards.forEach(card => {
    card.addEventListener('click', function () {
        // Remove selected class from all cards
        roleCards.forEach(c => c.classList.remove('selected'));

        // Add selected class to clicked card
        this.classList.add('selected');

        // Update selected role
        selectedRole = this.dataset.role;
        document.getElementById('selectedRole').value = selectedRole;

        // Add animation
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
});

// Password Toggle
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');

if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;

        // Toggle icon
        const icon = this.querySelector('i');
        if (type === 'password') {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            this.classList.remove('active');
        } else {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            this.classList.add('active');
        }
    });
}

// Password Strength Checker
const checkPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return strength;
};

const updatePasswordStrength = () => {
    const password = passwordInput.value;
    const strengthContainer = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!password || !isSignupMode) {
        strengthContainer.classList.remove('visible');
        return;
    }

    strengthContainer.classList.add('visible');

    const strength = checkPasswordStrength(password);

    // Remove all classes
    strengthFill.classList.remove('weak', 'medium', 'strong');
    strengthText.classList.remove('weak', 'medium', 'strong');

    if (strength <= 2) {
        strengthFill.classList.add('weak');
        strengthText.classList.add('weak');
        strengthText.textContent = 'Weak password';
    } else if (strength <= 4) {
        strengthFill.classList.add('medium');
        strengthText.classList.add('medium');
        strengthText.textContent = 'Medium strength';
    } else {
        strengthFill.classList.add('strong');
        strengthText.classList.add('strong');
        strengthText.textContent = 'Strong password';
    }
};

if (passwordInput) {
    passwordInput.addEventListener('input', updatePasswordStrength);
}

// Email Validation
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Username Validation
const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
};

// Form Validation
const validateForm = () => {
    let isValid = true;

    const username = document.getElementById('username');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const terms = document.getElementById('terms');

    // Clear previous errors
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });

    // Validate username
    if (!username.value.trim()) {
        showError(username, 'Username is required');
        isValid = false;
    } else if (!validateUsername(username.value)) {
        showError(username, 'Username must be 3-20 characters (letters, numbers, underscores only)');
        isValid = false;
    } else {
        showSuccess(username);
    }

    // Validate email
    if (!email.value.trim()) {
        showError(email, 'Email is required');
        isValid = false;
    } else if (!validateEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        showSuccess(email);
    }

    // Validate password
    if (!password.value) {
        showError(password, 'Password is required');
        isValid = false;
    } else if (password.value.length < 8) {
        showError(password, 'Password must be at least 8 characters');
        isValid = false;
    } else {
        showSuccess(password);
    }

    // Validate role selection (only for signup)
    if (isSignupMode) {
        if (!selectedRole) {
            showNotification('Please select your role: Start a Business or Find Gigs', 'error');
            isValid = false;
        }

        // Validate terms
        if (!terms.checked) {
            showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
            isValid = false;
        }
    }

    return isValid;
};

const showError = (input, message) => {
    const formGroup = input.closest('.form-group') || input.closest('.password-wrapper')?.parentElement;
    if (formGroup) {
        formGroup.classList.add('error');
        formGroup.classList.remove('success');

        let errorMsg = formGroup.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            formGroup.appendChild(errorMsg);
        }
        errorMsg.textContent = message;
    }
};

const showSuccess = (input) => {
    const formGroup = input.closest('.form-group') || input.closest('.password-wrapper')?.parentElement;
    if (formGroup) {
        formGroup.classList.add('success');
        formGroup.classList.remove('error');

        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.textContent = '';
        }
    }
};

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;

    // Add notification styles if not exists
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 24px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 12px;
                font-size: 14px;
                font-weight: 500;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 10px 40px rgba(0,0,0,0.15);
            }
            .notification-success {
                background: #10B981;
                color: white;
            }
            .notification-error {
                background: #EF4444;
                color: white;
            }
            .notification-info {
                background: #3921A2;
                color: white;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Form Submission with Firebase
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!firebaseInitialized) {
            showNotification('Firebase is not ready. Please wait and try again.', 'error');
            return;
        }

        const submitBtn = authForm.querySelector('.btn-submit');
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitText.textContent = isSignupMode ? 'Creating Account...' : 'Signing In...';

        try {
            if (isSignupMode) {
                // Map role to backend format
                const role = selectedRole === 'entrepreneur' ? 'founder' : 'collaborator';

                const result = await window.ForwardFirebase.signUpWithEmail(email, password, username, role);

                if (result.success) {
                    showNotification(`Account created successfully! Welcome to Forward.`, 'success');

                    // Short delay then redirect
                    setTimeout(() => {
                        if (role === 'collaborator') {
                            window.location.href = 'onboarding-collaborator.html';
                        } else {
                            window.location.href = 'onboarding.html';
                        }
                    }, 1500);
                } else {
                    handleAuthError(result.code, result.error);
                }
            } else {
                // Login
                const result = await window.ForwardFirebase.signInWithEmail(email, password);

                if (result.success) {
                    showNotification('Login successful! Redirecting...', 'success');

                    // Redirect based on user role
                    setTimeout(() => {
                        redirectAfterAuth(result.user);
                    }, 1000);
                } else {
                    handleAuthError(result.code, result.error);
                }
            }
        } catch (error) {
            console.error('Auth error:', error);
            showNotification('An unexpected error occurred. Please try again.', 'error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitText.textContent = isSignupMode ? 'Create Account' : 'Login';
        }
    });
}

// Handle Firebase auth errors
function handleAuthError(code, message) {
    switch (code) {
        case 'auth/email-already-in-use':
            showNotification('This email is already registered. Please login instead.', 'error');
            break;
        case 'auth/invalid-email':
            showNotification('Please enter a valid email address.', 'error');
            break;
        case 'auth/weak-password':
            showNotification('Password is too weak. Please use at least 8 characters.', 'error');
            break;
        case 'auth/user-not-found':
            showNotification('No account found with this email. Please sign up.', 'error');
            break;
        case 'auth/wrong-password':
            showNotification('Incorrect password. Please try again.', 'error');
            break;
        case 'auth/too-many-requests':
            showNotification('Too many failed attempts. Please try again later.', 'error');
            break;
        case 'auth/invalid-credential':
            showNotification('Invalid email or password. Please check and try again.', 'error');
            break;
        default:
            showNotification(message || 'Authentication failed. Please try again.', 'error');
    }
}

// Google Sign In
document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', async function () {
        const provider = this.textContent.trim();

        if (provider === 'Google') {
            if (!firebaseInitialized) {
                showNotification('Firebase is not ready. Please wait and try again.', 'error');
                return;
            }

            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';

            try {
                const result = await window.ForwardFirebase.signInWithGoogle();

                if (result.success) {
                    showNotification('Google sign-in successful! Redirecting...', 'success');
                    setTimeout(() => {
                        redirectAfterAuth(result.user);
                    }, 1000);
                } else {
                    if (result.code !== 'auth/popup-closed-by-user') {
                        showNotification(result.error || 'Google sign-in failed', 'error');
                    }
                }
            } catch (error) {
                console.error('Google sign-in error:', error);
                showNotification('Google sign-in failed. Please try again.', 'error');
            } finally {
                this.disabled = false;
                this.innerHTML = '<i class="fab fa-google"></i> Google';
            }
        } else {
            showNotification('GitHub sign-in coming soon!', 'info');
        }
    });
});

// Real-time validation on blur
document.getElementById('username')?.addEventListener('blur', function () {
    if (this.value.trim()) {
        if (!validateUsername(this.value)) {
            showError(this, 'Username must be 3-20 characters (letters, numbers, underscores only)');
        } else {
            showSuccess(this);
        }
    }
});

document.getElementById('email')?.addEventListener('blur', function () {
    if (this.value.trim()) {
        if (!validateEmail(this.value)) {
            showError(this, 'Please enter a valid email address');
        } else {
            showSuccess(this);
        }
    }
});

// Add ripple effect to buttons
const createRipple = (event) => {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
    ripple.classList.add('ripple');

    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }

    button.appendChild(ripple);
};

// Add ripple to all buttons
document.querySelectorAll('.btn, .btn-social').forEach(button => {
    button.addEventListener('click', createRipple);
});

// Input focus animations
const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');

inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('focused');
    });
});

// Auto-focus first input
window.addEventListener('load', () => {
    const firstInput = document.getElementById('username');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 500);
    }

    // Check auth status if available
    if (window.ForwardFirebase && window.ForwardFirebase.checkUnauthAndRedirect) {
        window.ForwardFirebase.checkUnauthAndRedirect();
    }
});

// Console welcome message
console.log('%c Welcome to Forward! ', 'background: #3921A2; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Start your entrepreneurial journey today ', 'font-size: 14px; color: #475569;');