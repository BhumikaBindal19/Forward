// Header Component
const createHeader = () => {
    const isSubfolder = window.location.pathname.includes('/pages/');
    const basePath = isSubfolder ? '../' : '';
    const pagesPath = isSubfolder ? '' : 'pages/';

    const header = document.createElement('header');
    header.className = 'header';

    header.innerHTML = `
        <nav class="navbar">
            <div class="container nav-container">
                <div class="logo">
                    <a href="${basePath}index.html" class="logo">
                        <img src="${basePath}assets/logo.png" alt="Forward Logo" />
                    </a>
                </div>
                
                <button class="mobile-toggle" aria-label="Toggle navigation">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                
                <ul class="nav-menu">
                    <li><a href="${basePath}index.html" class="nav-link">Home</a></li>
                    <li><a href="${basePath}index.html#how-it-works" class="nav-link">About</a></li>
                    <li><a href="${basePath}index.html#features" class="nav-link">Features</a></li>
                </ul>
                
                <div class="nav-actions" id="nav-actions">
                    <a href="${pagesPath}auth.html" class="nav-link">Log In</a>
                    <a href="${pagesPath}auth.html" class="btn btn-primary btn-sm">Get Started</a>
                </div>
            </div>
        </nav>
    `;

    // Add styles for header
    const style = document.createElement('style');
    style.textContent = `
        .header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid var(--gray-200);
            transition: all var(--transition-base);
        }
        
        .header.scrolled {
            background: rgba(255, 255, 255, 0.95);
            box-shadow: var(--shadow-md);
        }
        
        .navbar {
            padding: 16px 0;
        }
        
        .nav-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 24px;
            font-weight: var(--font-weight-bold);
            color: var(--text-primary);
            text-decoration: none;
            transition: all var(--transition-base);
        }
        
        .logo i {
            font-size: 28px;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            transform: rotate(-45deg);
        }
        
        .logo:hover {
            transform: translateY(-2px);
        }
        
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 32px;
            margin: 0;
        }
        
        .nav-link {
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: var(--font-weight-medium);
            font-size: 15px;
            transition: all var(--transition-base);
            position: relative;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--gradient-primary);
            transition: width var(--transition-base);
        }
        
        .nav-link:hover {
            color: var(--primary-color);
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .nav-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .user-link {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .user-link i {
            font-size: 18px;
        }
        
        .btn-sm {
            padding: 10px 20px;
            font-size: 14px;
        }

        .btn-outline {
            background: transparent;
            border: 2px solid var(--primary-color);
            color: var(--primary-color);
            padding: 8px 18px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all var(--transition-base);
        }

        .btn-outline:hover {
            background: var(--primary-color);
            color: white;
        }
        
        .mobile-toggle {
            display: none;
            flex-direction: column;
            gap: 5px;
            background: none;
            border: none;
            cursor: pointer;
            padding: 8px;
        }
        
        .mobile-toggle span {
            width: 25px;
            height: 3px;
            background: var(--text-primary);
            border-radius: 3px;
            transition: all var(--transition-base);
        }
        
        .mobile-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(6px, 6px);
        }
        
        .mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(6px, -6px);
        }
        
        @media (max-width: 768px) {
            .nav-menu {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: white;
                flex-direction: column;
                gap: 0;
                padding: 20px;
                box-shadow: var(--shadow-lg);
                transform: translateY(-150%);
                opacity: 0;
                transition: all var(--transition-base);
            }
            
            .nav-menu.active {
                transform: translateY(0);
                opacity: 1;
            }
            
            .nav-menu li {
                padding: 15px 0;
                border-bottom: 1px solid var(--gray-200);
            }
            
            .nav-actions {
                display: none;
            }
            
            .mobile-toggle {
                display: flex;
            }
        }
    `;

    document.head.appendChild(style);
    return header;
};

// Update nav actions based on auth state
async function updateNavForAuth(user) {
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;

    const isSubfolder = window.location.pathname.includes('/pages/');
    const basePath = isSubfolder ? '../' : '';
    const pagesPath = isSubfolder ? '' : 'pages/';

    if (user) {
        // Show loading state initially
        navActions.innerHTML = `
            <a href="#" class="nav-link loading-dash">Dashboard...</a>
            <a href="${pagesPath}profile.html" class="nav-link user-link">
                <i class="fas fa-user-circle"></i>
                <span>${user.displayName || user.email?.split('@')[0] || 'Profile'}</span>
            </a>
            <button class="btn btn-outline btn-sm" id="logout-btn">Log Out</button>
        `;

        // Fetch user data to determine role
        let dashboardUrl = `${pagesPath}progress.html`;
        if (window.ForwardFirebase) {
            const result = await window.ForwardFirebase.getUserDocument(user.uid);
            if (result.success) {
                const userData = result.data;
                const role = userData.role || 'founder';
                const isComplete = userData.onboardingCompleted === true;

                if (!isComplete) {
                    dashboardUrl = role === 'collaborator' ? `${pagesPath}onboarding-collaborator.html` : `${pagesPath}onboarding.html`;
                } else {
                    dashboardUrl = role === 'collaborator' ? `${pagesPath}gigboard.html` : `${pagesPath}progress.html`;
                }
            }
        }

        // Update with correct link
        const dashLink = navActions.querySelector('.loading-dash');
        if (dashLink) {
            dashLink.href = dashboardUrl;
            dashLink.textContent = 'Dashboard';
            dashLink.classList.remove('loading-dash');
        }

        // Add logout handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                if (window.ForwardFirebase) {
                    await window.ForwardFirebase.signOut();
                    window.location.href = basePath + 'index.html';
                }
            });
        }
    } else {
        // User is not logged in
        navActions.innerHTML = `
            <a href="${pagesPath}auth.html" class="nav-link">Log In</a>
            <a href="${pagesPath}auth.html" class="btn btn-primary btn-sm">Get Started</a>
        `;
    }
}

// Insert header into container
const headerContainer = document.getElementById('header-container');
if (headerContainer) {
    headerContainer.appendChild(createHeader());
}

// Wait for Firebase to be ready and listen for auth changes
setTimeout(() => {
    if (window.ForwardFirebase && window.ForwardFirebase.initializeFirebase) {
        window.ForwardFirebase.initializeFirebase();
        window.ForwardFirebase.onAuthStateChanged(updateNavForAuth);
    }
}, 100);

// Handle scroll effect
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const currentScroll = window.pageYOffset;

    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Handle mobile menu toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Close mobile menu when clicking on a link
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            const target = document.querySelector(href);
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});