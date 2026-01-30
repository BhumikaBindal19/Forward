// Main JavaScript File
// Firebase is initialized via firebase-config.js loaded from CDN

// Success Stories Carousel
let currentSlide = 0;
let carouselInterval;

const initCarousel = () => {
    const cards = document.querySelectorAll('.success-card');
    const dotsContainer = document.querySelector('.carousel-dots');

    if (!cards.length || !dotsContainer) return;

    // Create dots
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `carousel-dot ${index === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    // Auto-play carousel
    startCarousel();
};

const goToSlide = (index) => {
    const cards = document.querySelectorAll('.success-card');
    const dots = document.querySelectorAll('.carousel-dot');

    if (!cards.length) return;

    // Remove active and prev classes
    cards.forEach(card => {
        card.classList.remove('active', 'prev');
    });

    dots.forEach(dot => {
        dot.classList.remove('active');
    });

    // Set previous slide
    if (currentSlide !== index) {
        cards[currentSlide].classList.add('prev');
    }

    // Set current slide
    currentSlide = index;
    cards[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
};

const nextSlide = () => {
    const cards = document.querySelectorAll('.success-card');
    if (!cards.length) return;

    const next = (currentSlide + 1) % cards.length;
    goToSlide(next);
};

const startCarousel = () => {
    carouselInterval = setInterval(nextSlide, 4000); // Change slide every 4 seconds
};

const stopCarousel = () => {
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
};

// Initialize carousel when DOM is ready
document.addEventListener('DOMContentLoaded', initCarousel);

// Pause carousel on hover
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.success-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopCarousel);
        carousel.addEventListener('mouseleave', startCarousel);
    }
});

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

// Add observe class to elements and observe them
window.addEventListener('load', () => {
    const featureCards = document.querySelectorAll('.feature-card');
    const stepCards = document.querySelectorAll('.step-card');
    const statCards = document.querySelectorAll('.stat-card');

    [...featureCards, ...stepCards, ...statCards].forEach(el => {
        el.classList.add('observe');
        observer.observe(el);
    });
});

// Smooth parallax effect for hero section
let ticking = false;

const updateParallax = () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');

    if (hero) {
        const heroContent = hero.querySelector('.container');
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled * 0.002);
        }
    }

    ticking = false;
};

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Counter animation for stats
const animateCounter = (element, target, duration = 2000) => {
    let start = 0;
    const increment = target / (duration / 16);

    const updateCounter = () => {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + (element.dataset.suffix || '');
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + (element.dataset.suffix || '');
        }
    };

    updateCounter();
};

// Observe stat cards and animate when visible
const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            const number = entry.target.querySelector('.stat-number');
            const text = number.textContent;
            const value = parseInt(text.replace(/\D/g, ''));
            const suffix = text.replace(/[0-9]/g, '');
            number.dataset.suffix = suffix;
            number.textContent = '0' + suffix;

            setTimeout(() => {
                animateCounter(number, value);
            }, 200);
        }
    });
}, { threshold: 0.5 });

window.addEventListener('load', () => {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => statObserver.observe(card));
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

    const rippleElement = button.querySelector('.ripple');
    if (rippleElement) {
        rippleElement.remove();
    }

    button.appendChild(ripple);
};

// Add ripple styles
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Add ripple to all buttons
document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', createRipple);
    });
});

// Mouse move effect for hero section
const hero = document.querySelector('.hero');
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX / window.innerWidth;
    mouseY = e.clientY / window.innerHeight;
});

const animateHeroBackground = () => {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    if (hero) {
        const heroBackground = hero.querySelector('::before');
        hero.style.setProperty('--mouse-x', targetX);
        hero.style.setProperty('--mouse-y', targetY);
    }

    requestAnimationFrame(animateHeroBackground);
};

animateHeroBackground();

// Add tilt effect to feature cards
const addTiltEffect = (card) => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
};

window.addEventListener('load', () => {
    const cards = document.querySelectorAll('.feature-card, .step-card');
    cards.forEach(card => {
        card.style.transition = 'transform 0.3s ease';
        addTiltEffect(card);
    });
});

// Lazy loading for images (if any are added later)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));
}

// Add active state to navigation links based on scroll position
const sections = document.querySelectorAll('section[id]');

const setActiveNav = () => {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', setActiveNav);

// Add active state style
const navActiveStyle = document.createElement('style');
navActiveStyle.textContent = `
    .nav-link.active {
        color: var(--primary-color);
    }
    
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(navActiveStyle);

// Form validation (if forms are added)
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// Console welcome message
console.log('%c Welcome to Forward! ', 'background: #2463eb; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Empowering entrepreneurs to execute their vision ', 'font-size: 14px; color: #475569;');

// Performance monitoring
window.addEventListener('load', () => {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log(`Page loaded in ${pageLoadTime}ms`);
});

// Add custom cursor effect (optional, can be commented out for simpler design)
const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

const cursorFollower = document.createElement('div');
cursorFollower.className = 'cursor-follower';
document.body.appendChild(cursorFollower);

let cursorX = 0;
let cursorY = 0;
let followerX = 0;
let followerY = 0;

document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

const animateCursor = () => {
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;

    followerX += (cursorX - followerX) * 0.1;
    followerY += (cursorY - followerY) * 0.1;
    cursorFollower.style.transform = `translate(${followerX}px, ${followerY}px)`;

    requestAnimationFrame(animateCursor);
};

animateCursor();

// Cursor styles
const cursorStyle = document.createElement('style');
cursorStyle.textContent = `
    .custom-cursor,
    .cursor-follower {
        position: fixed;
        pointer-events: none;
        z-index: 9999;
        mix-blend-mode: difference;
    }
    
    .custom-cursor {
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
    }
    
    .cursor-follower {
        width: 40px;
        height: 40px;
        border: 2px solid white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s;
    }
    
    @media (max-width: 768px) {
        .custom-cursor,
        .cursor-follower {
            display: none;
        }
    }
`;
document.head.appendChild(cursorStyle);

// Expand cursor on interactive elements
document.addEventListener('DOMContentLoaded', () => {
    const interactiveElements = document.querySelectorAll('a, button, .btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.style.width = '60px';
            cursorFollower.style.height = '60px';
        });

        el.addEventListener('mouseleave', () => {
            cursorFollower.style.width = '40px';
            cursorFollower.style.height = '40px';
        });
    });
});