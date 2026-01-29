// Profile Page JavaScript

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeAnimations();
    initializeInteractions();
    animateProgressBar();
});

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
            console.log('Share profile clicked');
            copyProfileLink();
        });
    }

    // Opportunity Cards
    const opportunityCards = document.querySelectorAll('.opportunity-card');
    opportunityCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Don't trigger if clicking the button
            if (!e.target.closest('.opportunity-btn')) {
                const title = this.querySelector('.opportunity-title').textContent;
                console.log('Opportunity clicked:', title);
                showOpportunityDetails(this);
            }
        });
    });

    // Opportunity Buttons
    const opportunityBtns = document.querySelectorAll('.opportunity-btn');
    opportunityBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const card = this.closest('.opportunity-card');
            const title = card.querySelector('.opportunity-title').textContent;
            console.log('Apply to opportunity:', title);
            applyToOpportunity(title);
        });
    });

    // Progress Items
    const progressItems = document.querySelectorAll('.progress-item');
    progressItems.forEach(item => {
        item.addEventListener('click', function () {
            const title = this.querySelector('.progress-title').textContent;
            console.log('Progress item clicked:', title);
            showProgressDetails(this);
        });
    });

    // Search Bar
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // User Avatar
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', () => {
            console.log('User avatar clicked');
            toggleUserMenu();
        });
    }

    // Add ripple effect to buttons
    addRippleEffect();
}

// Animate progress bar
function animateProgressBar() {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const targetWidth = progressBar.style.width;
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

        // Animate the button
        const shareBtn = document.querySelector('.btn-secondary');
        shareBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            shareBtn.style.transform = '';
        }, 200);
    }).catch(err => {
        console.error('Failed to copy:', err);
        showNotification('Failed to copy link', 'error');
    });
}

// Show opportunity details
function showOpportunityDetails(card) {
    // Add pulse animation
    card.style.animation = 'pulse 0.5s ease-out';
    setTimeout(() => {
        card.style.animation = '';
    }, 500);

    // In production, this would open a modal
    showNotification('Opportunity details will open here', 'info');
}

// Apply to opportunity
function applyToOpportunity(title) {
    showNotification(`Applying to: ${title}`, 'success');

    // Simulate application process
    setTimeout(() => {
        showNotification('Application submitted successfully!', 'success');
    }, 1500);
}

// Show progress details
function showProgressDetails(item) {
    // Add highlight effect
    item.style.background = 'var(--white)';
    item.style.boxShadow = 'var(--shadow-lg)';

    setTimeout(() => {
        item.style.background = '';
        item.style.boxShadow = '';
    }, 1000);

    showNotification('Progress details will open here', 'info');
}

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    console.log('Searching for:', query);

    if (query.length > 0) {
        // In production, this would filter opportunities
        showNotification(`Searching for: ${query}`, 'info');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        background: var(--white);
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        border-left: 4px solid ${getNotificationColor(type)};
    `;

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

// Get notification color
function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        info: '#3b82f6',
        warning: '#f59e0b'
    };
    return colors[type] || colors.info;
}

// Toggle user menu
function toggleUserMenu() {
    showNotification('User menu will open here', 'info');
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

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.02);
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Console message
console.log('%c Welcome to Forward Profile! ', 'background: #3921A2; color: white; font-size: 16px; padding: 8px; border-radius: 4px;');
console.log('%c Your professional ecosystem awaits ', 'font-size: 12px; color: #64748b;');

// Track page view
console.log('Profile page loaded for:', document.querySelector('.profile-name')?.textContent);

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput && searchInput === document.activeElement) {
            searchInput.value = '';
            searchInput.blur();
        }
    }
});

// Auto-refresh progress (simulate real-time updates)
setInterval(() => {
    const progressBar = document.querySelector('.progress-fill');
    if (progressBar) {
        const currentWidth = parseInt(progressBar.style.width);
        if (currentWidth < 100) {
            // Slowly increment progress
            const newWidth = Math.min(currentWidth + Math.random(), 100);
            progressBar.style.width = `${newWidth}%`;
        }
    }
}, 30000); // Every 30 seconds

// Handle visibility change
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('Welcome back!');
        // Refresh data when user returns to tab
    }
});