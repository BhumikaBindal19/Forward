// Gig Board JavaScript

// Gig Data
const gigs = [
    {
        id: 1,
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
    },
    {
        id: 2,
        title: "Product Designer",
        description: "Redesigning the onboarding flow for a clean-energy monitoring dashboard. High focus on UX.",
        icon: "fa-pen-ruler",
        iconColor: "icon-purple",
        badge: null,
        tags: ["UI/UX", "Figma"],
        location: "Hybrid (London)",
        locationIcon: "fa-map-marker-alt",
        duration: "1 month",
        durationIcon: "fa-calendar",
        category: "design",
        skills: ["design"]
    },
    {
        id: 3,
        title: "Full-stack Developer",
        description: "Building a community portal for ethical investors using a modern React and Node stack.",
        icon: "fa-code",
        iconColor: "icon-orange",
        badge: null,
        tags: ["React", "Node.js"],
        location: "Remote",
        locationIcon: "fa-globe",
        duration: "3 months",
        durationIcon: "fa-clock",
        category: "development",
        skills: ["development"]
    },
    {
        id: 4,
        title: "Social Media Strategist",
        description: "Drive engagement for a non-profit foundation through ethical growth hacking and creative ads.",
        icon: "fa-bullhorn",
        iconColor: "icon-green",
        badge: null,
        tags: ["Growth", "Ads"],
        location: "Remote",
        locationIcon: "fa-globe",
        duration: "2 weeks",
        durationIcon: "fa-clock",
        category: "marketing",
        skills: ["marketing"]
    },
    {
        id: 5,
        title: "Content Writer",
        description: "Drafting a whitepaper on the future of decentralised impact governance. High quality research needed.",
        icon: "fa-edit",
        iconColor: "icon-indigo",
        badge: null,
        tags: ["SEO", "Editorial"],
        location: "Remote",
        locationIcon: "fa-globe",
        duration: "1 month",
        durationIcon: "fa-calendar",
        category: "writing",
        skills: ["writing"]
    },
    {
        id: 6,
        title: "Financial Analyst",
        description: "Audit and forecasting for a micro-loan platform operating in emerging markets.",
        icon: "fa-chart-bar",
        iconColor: "icon-red",
        badge: null,
        tags: ["Planning", "Excel"],
        location: "On-site (Berlin)",
        locationIcon: "fa-building",
        duration: "2 months",
        durationIcon: "fa-calendar",
        category: "analytics",
        skills: ["analytics"]
    }
];

// State
let currentGigs = [...gigs];
let visibleCount = 6;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderGigs();
    setupFilters();
    setupSearch();
    setupLoadMore();
});

// Render Gigs
function renderGigs() {
    const gigsGrid = document.getElementById('gigsGrid');
    gigsGrid.innerHTML = '';

    const gigsToShow = currentGigs.slice(0, visibleCount);

    gigsToShow.forEach((gig, index) => {
        const gigCard = createGigCard(gig, index);
        gigsGrid.appendChild(gigCard);
    });

    updateCount();
}

// Create Gig Card
function createGigCard(gig, index) {
    const card = document.createElement('div');
    card.className = 'gig-card';
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
        <div class="gig-header">
            <div class="gig-icon ${gig.iconColor}">
                <i class="fas ${gig.icon}"></i>
            </div>
            ${gig.badge ? `<span class="gig-badge">${gig.badge}</span>` : ''}
        </div>
        <h3 class="gig-title">${gig.title}</h3>
        <p class="gig-description">${gig.description}</p>
        <div class="gig-tags">
            ${gig.tags.map(tag => `<span class="gig-tag">${tag}</span>`).join('')}
        </div>
        <div class="gig-footer">
            <div class="gig-meta">
                <div class="gig-meta-item">
                    <i class="fas ${gig.locationIcon}"></i>
                    <span>${gig.location}</span>
                </div>
                <div class="gig-meta-item">
                    <i class="fas ${gig.durationIcon}"></i>
                    <span>${gig.duration}</span>
                </div>
            </div>
            <button class="gig-btn">Interested</button>
        </div>
    `;

    // Add click handler
    const interestedBtn = card.querySelector('.gig-btn');
    interestedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleInterested(gig);
    });

    card.addEventListener('click', () => {
        handleGigClick(gig);
    });

    return card;
}

// Setup Filters
function setupFilters() {
    // Toggle dropdown menus
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const dropdown = this.closest('.filter-dropdown');
            const allDropdowns = document.querySelectorAll('.filter-dropdown');

            // Close other dropdowns
            allDropdowns.forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });

            // Toggle current dropdown
            dropdown.classList.toggle('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.filter-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });

    // Handle filter changes
    const filterOptions = document.querySelectorAll('.filter-option input[type="checkbox"]');
    filterOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });

    // Clear filters button
    const clearBtn = document.getElementById('clearFilters');
    clearBtn.addEventListener('click', clearFilters);
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

    currentGigs = gigs.filter(gig => {
        // If no specific filters selected, show all
        const skillMatch = skillFilters.length === 0 ||
            skillFilters.some(filter => gig.skills.includes(filter));

        const locationMatch = locationFilters.length === 0 ||
            locationFilters.some(filter => {
                if (filter === 'remote') return gig.location.toLowerCase().includes('remote');
                if (filter === 'onsite') return gig.location.toLowerCase().includes('on-site');
                if (filter === 'hybrid') return gig.location.toLowerCase().includes('hybrid');
                return true;
            });

        const durationMatch = durationFilters.length === 0 ||
            durationFilters.some(filter => {
                if (filter === '1-2weeks') return gig.duration.includes('week');
                if (filter === '1month') return gig.duration.includes('1 month');
                if (filter === '2-3months') return gig.duration.includes('2 month') || gig.duration.includes('3 month');
                if (filter === '3months+') return gig.duration.includes('month') && !gig.duration.includes('1 month');
                return true;
            });

        return skillMatch && locationMatch && durationMatch;
    });

    visibleCount = 6;
    renderGigs();
}

// Clear Filters
function clearFilters() {
    // Uncheck all filters except "all"
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(input => {
        if (input.value === 'all') {
            input.checked = true;
        } else {
            input.checked = false;
        }
    });

    currentGigs = [...gigs];
    visibleCount = 6;
    renderGigs();
}

// Setup Search
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    searchInput.addEventListener('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = this.value.toLowerCase().trim();

            if (query === '') {
                currentGigs = [...gigs];
            } else {
                currentGigs = gigs.filter(gig =>
                    gig.title.toLowerCase().includes(query) ||
                    gig.description.toLowerCase().includes(query) ||
                    gig.tags.some(tag => tag.toLowerCase().includes(query))
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
    loadMoreBtn.addEventListener('click', () => {
        visibleCount += 6;
        renderGigs();

        // Hide button if all gigs are shown
        if (visibleCount >= currentGigs.length) {
            loadMoreBtn.style.display = 'none';
        }
    });
}

// Update Count
function updateCount() {
    const currentCount = Math.min(visibleCount, currentGigs.length);
    const totalCount = gigs.length;

    document.getElementById('currentCount').textContent = currentCount;
    document.getElementById('totalCount').textContent = totalCount;

    // Show/hide load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (currentCount >= currentGigs.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// Handle Interested Click
function handleInterested(gig) {
    console.log('Interested in:', gig.title);

    // Show notification
    showNotification(`Applied to: ${gig.title}`, 'success');

    // Animate button
    const btn = event.target;
    btn.textContent = 'Applied ✓';
    btn.style.background = 'var(--gradient-primary)';
    btn.style.color = 'var(--white)';
    btn.disabled = true;

    // Reset after 2 seconds
    setTimeout(() => {
        btn.textContent = 'Interested';
        btn.style.background = '';
        btn.style.color = '';
        btn.disabled = false;
    }, 2000);
}

// Handle Gig Card Click
function handleGigClick(gig) {
    console.log('Clicked gig:', gig.title);
    showNotification('Opening gig details...', 'info');
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

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = { success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b' };
    return colors[type] || colors.info;
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Console message
console.log('%c Forward Gig Board ', 'background: #3921A2; color: white; font-size: 16px; padding: 8px; border-radius: 4px;');
console.log(`Loaded ${gigs.length} opportunities`);