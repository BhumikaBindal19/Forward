// Footer Component
const createFooter = () => {
    const footer = document.createElement('footer');
    footer.className = 'footer';

    const currentYear = new Date().getFullYear();

    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
                        <a href="index.html" class="logo">
                            <img src="logo-dark.png" alt="Forward Logo" />
                        </a>
                    </div>
                    <p class="footer-description">
                        Empowering entrepreneurs to execute their vision with AI-guided precision and ethical collaboration.
                    </p>
                    <div class="social-links">
                        <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                        <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                        <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                        <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                    </div>
                </div>
                
                <div class="footer-links">
                    <div class="footer-column">
                        <h4>Product</h4>
                        <ul>
                            <li><a href="#features">Features</a></li>
                            <li><a href="#how-it-works">How It Works</a></li>
                            <li><a href="#pricing">Pricing</a></li>
                            <li><a href="#roadmap">Roadmap</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#about">About Us</a></li>
                            <li><a href="#careers">Careers</a></li>
                            <li><a href="#blog">Blog</a></li>
                            <li><a href="#contact">Contact</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Resources</h4>
                        <ul>
                            <li><a href="#help">Help Center</a></li>
                            <li><a href="#community">Community</a></li>
                            <li><a href="#guides">Guides</a></li>
                            <li><a href="#api">API Docs</a></li>
                        </ul>
                    </div>
                    
                    <div class="footer-column">
                        <h4>Legal</h4>
                        <ul>
                            <li><a href="#privacy">Privacy Policy</a></li>
                            <li><a href="#terms">Terms of Service</a></li>
                            <li><a href="#cookies">Cookie Policy</a></li>
                            <li><a href="#compliance">Compliance</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div class="footer-bottom">
                <p>&copy; ${currentYear} Forward Inc. All rights reserved.</p>
                <div class="footer-bottom-links">
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#terms">Terms of Service</a>
                    <a href="#contact">Contact</a>
                </div>
            </div>
        </div>
    `;

    // Add styles for footer
    const style = document.createElement('style');
    style.textContent = `
        .footer {
            background: var(--primary-dark);
            color: var(--white);
            padding: 80px 20px 30px;
            margin-top: 100px;
        }
        
        .footer-content {
            display: grid;
            grid-template-columns: 1.5fr 2fr;
            gap: 64px;
            margin-bottom: 48px;
        }
        
        .footer-brand {
            max-width: 350px;
        }
        
        .footer-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 24px;
            font-weight: var(--font-weight-bold);
            color: var(--white);
            text-decoration: none;
            margin-bottom: 20px;
        }
        
        .footer-logo i {
            font-size: 28px;
            background: var(--gradient-primary);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            transform: rotate(-45deg);
        }
        
        .footer-description {
            color: var(--gray-300);
            line-height: 1.7;
            margin-bottom: 24px;
            font-size: 15px;
        }
        
        .social-links {
            display: flex;
            gap: 12px;
        }
        
        .social-links a {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--white);
            text-decoration: none;
            transition: all var(--transition-base);
        }
        
        .social-links a:hover {
            background: var(--primary-color);
            transform: translateY(-3px);
        }
        
        .footer-links {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 32px;
        }
        
        .footer-column h4 {
            font-size: 16px;
            font-weight: var(--font-weight-semibold);
            margin-bottom: 16px;
            color: var(--white);
        }
        
        .footer-column ul {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .footer-column a {
            color: var(--gray-300);
            text-decoration: none;
            font-size: 14px;
            transition: all var(--transition-base);
            display: inline-block;
        }
        
        .footer-column a:hover {
            color: var(--primary-light);
            transform: translateX(3px);
        }
        
        .footer-bottom {
            padding-top: 32px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        
        .footer-bottom p {
            color: var(--gray-300);
            font-size: 14px;
        }
        
        .footer-bottom-links {
            display: flex;
            gap: 24px;
        }
        
        .footer-bottom-links a {
            color: var(--gray-300);
            text-decoration: none;
            font-size: 14px;
            transition: color var(--transition-base);
        }
        
        .footer-bottom-links a:hover {
            color: var(--primary-light);
        }
        
        @media (max-width: 1024px) {
            .footer-content {
                grid-template-columns: 1fr;
                gap: 48px;
            }
            
            .footer-links {
                grid-template-columns: repeat(2, 1fr);
                gap: 32px;
            }
        }
        
        @media (max-width: 640px) {
            .footer {
                padding: 60px 20px 30px;
            }
            
            .footer-links {
                grid-template-columns: 1fr;
            }
            
            .footer-bottom {
                flex-direction: column;
                text-align: center;
            }
            
            .footer-bottom-links {
                flex-direction: column;
                gap: 12px;
            }
        }
    `;

    document.head.appendChild(style);
    return footer;
};

// Insert footer into container
const footerContainer = document.getElementById('footer-container');
if (footerContainer) {
    footerContainer.appendChild(createFooter());
}