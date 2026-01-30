// Profile Page JavaScript - Firebase Integration

// Global State
let currentUser = null;
let userData = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase
    setTimeout(initProfile, 200);
});

async function initProfile() {
    if (!window.ForwardFirebase) {
        console.error('ForwardFirebase not found');
        return;
    }

    window.ForwardFirebase.initializeFirebase();

    // Track auth state
    window.ForwardFirebase.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        currentUser = user;
        await loadUserProfile(user.uid);

        // Initialize UI components after data is loaded
        initializeAnimations();
        initializeInteractions();
        animateProgressBar();
    });
}

async function loadUserProfile(userId) {
    try {
        const result = await window.ForwardFirebase.getUserProfile(userId);
        if (result.success) {
            userData = result.data;
            updateUIWithProfile(userData);
        } else {
            console.error('Failed to load profile:', result.error);
            showNotification('Error loading profile data', 'error');
        }
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}

function updateUIWithProfile(data) {
    if (!data) return;

    // Update basic info
    const nameEl = document.querySelector('.profile-name');
    const roleEl = document.querySelector('.profile-role');
    const locationEl = document.querySelector('.profile-location span');
    const bioEl = document.querySelector('.profile-bio');

    if (nameEl) nameEl.textContent = data.fullName || data.displayName || 'User Name';
    if (roleEl) roleEl.textContent = data.role === 'founder' ? 'Modern Entrepreneur' : 'Skilled Collaborator';
    if (locationEl) locationEl.textContent = data.location || 'Remote';
    if (bioEl) bioEl.textContent = data.bio || 'Building the future with Forward.';

    // Update avatar if image exists
    const avatarImg = document.querySelector('.user-avatar img');
    if (avatarImg && data.photoURL) {
        avatarImg.src = data.photoURL;
    }

    // Update stats (mocked for now but could come from DB)
    const activeGigsEl = document.querySelectorAll('.stat-number')[0];
    const completedTasksEl = document.querySelectorAll('.stat-number')[1];
    const experienceEl = document.querySelectorAll('.stat-number')[2];

    if (activeGigsEl) activeGigsEl.textContent = data.activeGigsCount || '2';
    if (completedTasksEl) completedTasksEl.textContent = data.completedTasksCount || '15';
    if (experienceEl) experienceEl.textContent = data.experienceYears || '3';
}

// Initialize scroll-based animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all section cards
    document.querySelectorAll('.section-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });

    // Observe opportunity cards
    document.querySelectorAll('.opportunity-card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `all 0.5s ease-out ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Initialize interactive elements
function initializeInteractions() {
    // Edit Profile Button
    const editBtn = document.querySelector('.btn-primary');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            console.log('Edit profile clicked');
            showNotification('Edit profile feature coming soon!');
        });
    }

    // Share Profile Button
    const shareBtn = document.querySelector('.btn-secondary');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            copyProfileLink();
        });
    }

    // Opportunity Cards (Applied gigs)
    const opportunityCards = document.querySelectorAll('.opportunity-card');
    opportunityCards.forEach(card => {
        card.addEventListener('click', function (e) {
            if (!e.target.closest('.opportunity-btn')) {
                showNotification('Opening application details...', 'info');
            }
        });
    });

    // Search Bar
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            if (e.target.value) showNotification(`Searching: ${e.target.value}`, 'info');
        }, 500));
    }

    addRippleEffect();
}

// Animate progress bar
function animateProgressBar() {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const targetWidth = progressBar.style.width || '65%';
        progressBar.style.width = '0%';
        setTimeout(() => {
            progressBar.style.width = targetWidth;
        }, 500);
    }
}

// Copy profile link
function copyProfileLink() {
    const profileLink = window.location.href;
    navigator.clipboard.writeText(profileLink).then(() => {
        showNotification('Profile link copied to clipboard!', 'success');
    }).catch(err => {
        showNotification('Failed to copy link', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Internal Styles for notification
    if (!document.getElementById('profile-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'profile-notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 24px;
                right: 24px;
                background: white;
                padding: 16px 24px;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 10000;
                animation: slideInRight 0.3s ease-out;
            }
            .notification-success { border-left: 4px solid #10b981; }
            .notification-error { border-left: 4px solid #ef4444; }
            .notification-info { border-left: 4px solid #3b82f6; }
            .notification-warning { border-left: 4px solid #f59e0b; }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        notification.style.transition = 'all 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    return icons[type] || icons.info;
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add ripple effect
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn, .opportunity-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;

            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
}
