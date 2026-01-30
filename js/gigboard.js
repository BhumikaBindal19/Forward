// Gig Board JavaScript - Firebase Integration

// Gig Data (Fallback/Initial)
const mockGigs = [
    {
        id: "mock-1",
        title: "Marketing Consultant",
        description: "Shape the go-to-market strategy for a sustainable fashion startup focused on circular economy.",
        icon: "fa-chart-line",
        iconColor: "icon-blue",
        badge: "NEW",
        tags: ["Strategy", "Analytics"],
        location: "Remote",
        locationIcon: "fa-globe",
        duration: "2 weeks",
        durationIcon: "fa-clock",
        category: "marketing",
        skills: ["marketing", "analytics"]
    }
    // ... other mock gigs can be added here if needed
];

// State
let allGigs = [];
let currentGigs = [];
let visibleCount = 6;
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase
    setTimeout(initGigBoard, 200);
});

async function initGigBoard() {
    if (!window.ForwardFirebase) {
        console.error('ForwardFirebase not found');
        return;
    }

    window.ForwardFirebase.initializeFirebase();

    // Track auth state
    window.ForwardFirebase.onAuthStateChanged(async user => {
        currentUser = user;
        if (user) {
            // Check onboarding status
            const redirectPath = await window.ForwardFirebase.checkOnboardingStatus(user);
            if (redirectPath && redirectPath !== 'gigboard.html') {
                window.location.href = redirectPath;
                return;
            }

            await updateDashboardStats(user.uid);
            // Re-listen to gigs now that we have the user (for 'applied' state)
            listenToGigs();
        } else {
            window.location.href = 'auth.html';
        }
    });

    // Initial load
    listenToGigs();

    setupFilters();
    setupSearch();
    setupLoadMore();
}

async function updateDashboardStats(uid) {
    const result = await window.ForwardFirebase.getUserDocument(uid);
    if (result.success) {
        const userData = result.data;
        document.getElementById('appliedCount').textContent = (userData.appliedGigs || []).length;
        document.getElementById('activeCount').textContent = (userData.activeGigs || []).length;
        document.getElementById('earningsValue').textContent = `₹${userData.totalEarnings || 0}`;
    }
}

let unsubscribeGigs = null;
function listenToGigs() {
    if (unsubscribeGigs) unsubscribeGigs();

    unsubscribeGigs = window.ForwardFirebase.listenToOpenGigs(async (gigs) => {
        // Fetch current user data to see what's applied
        let appliedGigs = [];
        if (currentUser) {
            const result = await window.ForwardFirebase.getUserDocument(currentUser.uid);
            if (result.success) {
                appliedGigs = result.data.appliedGigs || [];
            }
        }

        allGigs = gigs.map(gig => ({
            ...gig,
            applied: appliedGigs.includes(gig.id)
        }));
        currentGigs = [...allGigs];
        renderGigs();
    });
}

// Render Gigs
function renderGigs() {
    const gigsGrid = document.getElementById('gigsGrid');
    if (!gigsGrid) return;

    gigsGrid.innerHTML = '';

    const gigsToShow = currentGigs.slice(0, visibleCount);

    if (gigsToShow.length === 0) {
        gigsGrid.innerHTML = '<div class="no-results">No opportunities found matching your criteria.</div>';
    } else {
        gigsToShow.forEach((gig, index) => {
            const gigCard = createGigCard(gig, index);
            gigsGrid.appendChild(gigCard);
        });
    }

    updateCount();
}

// Create Gig Card
function createGigCard(gig, index) {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.style.animationDelay = `${index * 0.1}s`;

    const iconColor = gig.iconColor || 'icon-blue';
    const icon = gig.icon || 'fa-briefcase';

    card.innerHTML = `
        <div class="gig-header">
            <div class="gig-icon ${iconColor}">
                <i class="fas ${icon}"></i>
            </div>
            ${gig.badge ? `<span class="gig-badge">${gig.badge}</span>` : ''}
        </div>
        <h3 class="gig-title">${gig.title}</h3>
        <p class="gig-description">${gig.description}</p>
        <div class="gig-tags">
            ${(gig.tags || []).map(tag => `<span class="gig-tag">${tag}</span>`).join('')}
        </div>
        <div class="gig-footer">
            <div class="gig-meta">
                <div class="gig-meta-item">
                    <i class="fas ${gig.locationIcon || 'fa-globe'}"></i>
                    <span>${gig.location || 'Remote'}</span>
                </div>
                <div class="gig-meta-item">
                    <i class="fas ${gig.durationIcon || 'fa-clock'}"></i>
                    <span>${gig.duration || 'Flexible'}</span>
                </div>
            </div>
            <button class="gig-btn" ${gig.applied ? 'disabled' : ''}>
                ${gig.applied ? 'Applied ✓' : 'Interested'}
            </button>
        </div>
    `;

    // Add click handler
    const interestedBtn = card.querySelector('.gig-btn');
    interestedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleInterested(gig, interestedBtn);
    });

    card.addEventListener('click', () => {
        handleGigClick(gig);
    });

    return card;
}

// Setup Filters
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const dropdown = this.closest('.filter-dropdown');
            const allDropdowns = document.querySelectorAll('.filter-dropdown');

            allDropdowns.forEach(d => {
                if (d !== dropdown) d.classList.remove('active');
            });

            dropdown.classList.toggle('active');
        });
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });

    const filterOptions = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });

    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) clearBtn.addEventListener('click', clearFilters);
}

// Apply Filters
function applyFilters() {
    const skillFilters = Array.from(document.querySelectorAll('#skillsMenu input[type="checkbox"]:checked'))
        .map(input => input.value)
        .filter(value => value !== 'all');

    const locationFilters = Array.from(document.querySelectorAll('#locationMenu input[type="checkbox"]:checked'))
        .map(input => input.value)
        .filter(value => value !== 'all');

    const durationFilters = Array.from(document.querySelectorAll('#durationMenu input[type="checkbox"]:checked'))
        .map(input => input.value)
        .filter(value => value !== 'all');

    currentGigs = allGigs.filter(gig => {
        const skillMatch = skillFilters.length === 0 ||
            skillFilters.some(filter => (gig.skills || []).includes(filter));

        const locationMatch = locationFilters.length === 0 ||
            locationFilters.some(filter => {
                const loc = (gig.location || '').toLowerCase();
                if (filter === 'remote') return loc.includes('remote');
                if (filter === 'onsite') return loc.includes('on-site') || loc.includes('onsite');
                if (filter === 'hybrid') return loc.includes('hybrid');
                return true;
            });

        const durationMatch = durationFilters.length === 0 ||
            durationFilters.some(filter => {
                const dur = (gig.duration || '').toLowerCase();
                if (filter === '1-2weeks') return dur.includes('week');
                if (filter === '1month') return dur.includes('1 month');
                if (filter === '2-3months') return dur.includes('2 month') || dur.includes('3 month');
                if (filter === '3months+') return dur.includes('month') && !dur.includes('1 month');
                return true;
            });

        return skillMatch && locationMatch && durationMatch;
    });

    visibleCount = 6;
    renderGigs();
}

// Clear Filters
function clearFilters() {
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(input => {
        input.checked = input.value === 'all';
    });

    currentGigs = [...allGigs];
    visibleCount = 6;
    renderGigs();
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    let searchTimeout;
    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();

            if (query === '') {
                currentGigs = [...allGigs];
            } else {
                currentGigs = allGigs.filter(gig =>
                    (gig.title || '').toLowerCase().includes(query) ||
                    (gig.description || '').toLowerCase().includes(query) ||
                    (gig.tags || []).some(tag => tag.toLowerCase().includes(query))
                );
            }

            visibleCount = 6;
            renderGigs();
        }, 300);
    });
}

// Setup Load More
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', () => {
        visibleCount += 6;
        renderGigs();
    });
}

// Update Count
function updateCount() {
    const currentCountEl = document.getElementById('currentCount');
    const totalCountEl = document.getElementById('totalCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (currentCountEl) currentCountEl.textContent = Math.min(visibleCount, currentGigs.length);
    if (totalCountEl) totalCountEl.textContent = currentGigs.length;

    if (loadMoreBtn) {
        loadMoreBtn.style.display = (visibleCount >= currentGigs.length) ? 'none' : 'inline-flex';
    }
}

// Handle Interested Click
async function handleInterested(gig, btn) {
    if (!currentUser) {
        showNotification('Please login to apply for gigs', 'warning');
        setTimeout(() => window.location.href = 'auth.html', 1500);
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const result = await window.ForwardFirebase.applyToGig(gig.id, currentUser.uid);

        if (result.success) {
            showNotification(`Successfully applied for: ${gig.title}`, 'success');
            btn.textContent = 'Applied ✓';
            btn.style.background = 'var(--gradient-primary)';
            btn.style.color = 'var(--white)';
            // Refresh stats
            await updateDashboardStats(currentUser.uid);
        } else {
            showNotification(result.error || 'Failed to apply', 'error');
            btn.disabled = false;
            btn.textContent = 'Interested';
        }
    } catch (error) {
        console.error('Error applying to gig:', error);
        showNotification('An error occurred. Please try again.', 'error');
        btn.disabled = false;
        btn.textContent = 'Interested';
    }
}

// Handle Gig Card Click
function handleGigClick(gig) {
    console.log('Clicked gig:', gig.title);
    // Future detail view implementation
}

// Show Notification
function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Notification styles (injected if not present)
    if (!document.getElementById('gigboard-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'gigboard-notification-styles';
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

// Console message
console.log('%c Forward Gig Board Ready ', 'background: #3921A2; color: white; padding: 4px; border-radius: 4px;');
