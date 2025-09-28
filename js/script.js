// ===== PORTFOLIO WEBSITE JAVASCRIPT =====

(function() {
    'use strict';

    // ===== CONSTANTS =====
    const ANIMATION_DELAY = 100;
    const SCROLL_THRESHOLD = 100;
    const TYPING_SPEED = 100;
    const LOADING_DURATION = 2000;

    // ===== DOM ELEMENTS =====
    const elements = {
        loadingScreen: document.getElementById('loading-screen'),
        navbar: document.getElementById('navbar'),
        hamburger: document.getElementById('hamburger'),
        navMenu: document.getElementById('nav-menu'),
        navLinks: document.querySelectorAll('.nav-link'),
        backToTop: document.getElementById('back-to-top'),
        contactForm: document.getElementById('contact-form'),
        downloadCv: document.getElementById('download-cv'),
        skillBars: document.querySelectorAll('.skill-progress'),
        sections: document.querySelectorAll('section[id]')
    };

    // ===== STATE MANAGEMENT =====
    const state = {
        isLoading: true,
        currentSection: 'home',
        isMenuOpen: false,
        hasScrolled: false,
        skillsAnimated: false,
        observerElements: new Set()
    };

    // ===== UTILITY FUNCTIONS =====
    const utils = {
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        throttle: (func, delay) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, delay);
                }
            };
        },

        isElementInViewport: (el) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        },

        smoothScrollTo: (target, duration = 1000) => {
            const targetElement = document.querySelector(target);
            if (!targetElement) return;

            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            let startTime = null;

            function animation(currentTime) {
                if (startTime === null) startTime = currentTime;
                const timeElapsed = currentTime - startTime;
                const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function easeInOutQuad(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        },

        validateEmail: (email) => {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        },

        showError: (fieldId, message) => {
            const errorElement = document.getElementById(`${fieldId}-error`);
            const inputElement = document.getElementById(fieldId);
            
            if (errorElement && inputElement) {
                errorElement.textContent = message;
                errorElement.classList.add('show');
                inputElement.style.borderColor = 'var(--error-color)';
            }
        },

        hideError: (fieldId) => {
            const errorElement = document.getElementById(`${fieldId}-error`);
            const inputElement = document.getElementById(fieldId);
            
            if (errorElement && inputElement) {
                errorElement.classList.remove('show');
                inputElement.style.borderColor = 'var(--border-color)';
            }
        }
    };

    // ===== LOADING SCREEN =====
    const loadingScreen = {
        init: () => {
            setTimeout(() => {
                loadingScreen.hide();
            }, LOADING_DURATION);
        },

        hide: () => {
            if (elements.loadingScreen) {
                elements.loadingScreen.classList.add('hidden');
                state.isLoading = false;
                
                setTimeout(() => {
                    elements.loadingScreen.style.display = 'none';
                    animations.initScrollAnimations();
                }, 500);
            }
        }
    };

    // ===== NAVIGATION =====
    const navigation = {
        init: () => {
            navigation.bindEvents();
            navigation.handleScroll();
        },

        bindEvents: () => {
            // Hamburger menu toggle
            if (elements.hamburger) {
                elements.hamburger.addEventListener('click', navigation.toggleMenu);
            }

            // Navigation links
            elements.navLinks.forEach(link => {
                link.addEventListener('click', navigation.handleNavClick);
            });

            // Scroll event
            window.addEventListener('scroll', utils.throttle(navigation.handleScroll, 10));

            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (state.isMenuOpen && !elements.navMenu.contains(e.target) && !elements.hamburger.contains(e.target)) {
                    navigation.closeMenu();
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.isMenuOpen) {
                    navigation.closeMenu();
                }
            });
        },

        toggleMenu: () => {
            state.isMenuOpen = !state.isMenuOpen;
            elements.hamburger.classList.toggle('active', state.isMenuOpen);
            elements.navMenu.classList.toggle('active', state.isMenuOpen);
            document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
        },

        closeMenu: () => {
            state.isMenuOpen = false;
            elements.hamburger.classList.remove('active');
            elements.navMenu.classList.remove('active');
            document.body.style.overflow = '';
        },

        handleNavClick: (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href');
            
            if (target && target.startsWith('#')) {
                utils.smoothScrollTo(target);
                navigation.closeMenu();
                navigation.setActiveLink(target.substring(1));
            }
        },

        handleScroll: () => {
            const scrollY = window.scrollY;
            
            // Navbar background
            if (scrollY > 50 && !state.hasScrolled) {
                elements.navbar.classList.add('scrolled');
                state.hasScrolled = true;
            } else if (scrollY <= 50 && state.hasScrolled) {
                elements.navbar.classList.remove('scrolled');
                state.hasScrolled = false;
            }

            // Back to top button
            if (elements.backToTop) {
                if (scrollY > SCROLL_THRESHOLD) {
                    elements.backToTop.classList.add('show');
                } else {
                    elements.backToTop.classList.remove('show');
                }
            }

            // Update active nav link
            navigation.updateActiveSection();
        },

        updateActiveSection: () => {
            let current = '';
            const scrollY = window.scrollY;

            elements.sections.forEach(section => {
                const sectionTop = section.getBoundingClientRect().top + scrollY - 100;
                const sectionHeight = section.offsetHeight;
                
                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            if (current && current !== state.currentSection) {
                navigation.setActiveLink(current);
                state.currentSection = current;
            }
        },

        setActiveLink: (sectionId) => {
            elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === sectionId) {
                    link.classList.add('active');
                }
            });
        }
    };

    // ===== ANIMATIONS =====
    const animations = {
        init: () => {
            animations.initScrollAnimations();
            animations.initSkillBars();
            animations.initTypingEffect();
        },

        initScrollAnimations: () => {
            if ('IntersectionObserver' in window) {
                const observerOptions = {
                    threshold: 0.1,
                    rootMargin: '0px 0px -50px 0px'
                };

                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            
                            // Animate skill bars when skills section is visible
                            if (entry.target.id === 'skills' && !state.skillsAnimated) {
                                setTimeout(() => animations.animateSkillBars(), 500);
                                state.skillsAnimated = true;
                            }
                        }
                    });
                }, observerOptions);

                // Observe all sections and animated elements
                document.querySelectorAll('section, .fade-in, .slide-in-left, .slide-in-right').forEach(el => {
                    observer.observe(el);
                    el.classList.add('fade-in');
                });
            }
        },

        initSkillBars: () => {
            elements.skillBars.forEach(bar => {
                bar.style.width = '0%';
            });
        },

        animateSkillBars: () => {
            elements.skillBars.forEach((bar, index) => {
                setTimeout(() => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width + '%';
                }, index * 200);
            });
        },

        initTypingEffect: () => {
            const heroTitle = document.querySelector('.hero-title .name');
            if (!heroTitle) return;

            const originalText = heroTitle.textContent;
            heroTitle.textContent = '';
            heroTitle.style.borderRight = '3px solid var(--accent-color)';

            let i = 0;
            const typeWriter = () => {
                if (i < originalText.length) {
                    heroTitle.textContent += originalText.charAt(i);
                    i++;
                    setTimeout(typeWriter, TYPING_SPEED);
                } else {
                    setTimeout(() => {
                        heroTitle.style.borderRight = 'none';
                    }, 1000);
                }
            };

            setTimeout(typeWriter, 1000);
        }
    };

    // ===== FORM HANDLING =====
    const formHandler = {
        init: () => {
            if (elements.contactForm) {
                elements.contactForm.addEventListener('submit', formHandler.handleSubmit);
                
                // Real-time validation
                const inputs = elements.contactForm.querySelectorAll('.form-input');
                inputs.forEach(input => {
                    input.addEventListener('blur', () => formHandler.validateField(input));
                    input.addEventListener('input', () => utils.hideError(input.id));
                });
            }
        },

        handleSubmit: (e) => {
            e.preventDefault();
            
            const formData = new FormData(elements.contactForm);
            const data = Object.fromEntries(formData);
            
            if (formHandler.validateForm(data)) {
                formHandler.submitForm(data);
            }
        },

        validateForm: (data) => {
            let isValid = true;
            
            // Name validation
            if (!data.name || data.name.trim().length < 2) {
                utils.showError('name', 'Name must be at least 2 characters long');
                isValid = false;
            } else {
                utils.hideError('name');
            }
            
            // Email validation
            if (!data.email || !utils.validateEmail(data.email)) {
                utils.showError('email', 'Please enter a valid email address');
                isValid = false;
            } else {
                utils.hideError('email');
            }
            
            // Subject validation
            if (!data.subject || data.subject.trim().length < 3) {
                utils.showError('subject', 'Subject must be at least 3 characters long');
                isValid = false;
            } else {
                utils.hideError('subject');
            }
            
            // Message validation
            if (!data.message || data.message.trim().length < 10) {
                utils.showError('message', 'Message must be at least 10 characters long');
                isValid = false;
            } else {
                utils.hideError('message');
            }
            
            return isValid;
        },

        validateField: (input) => {
            const value = input.value.trim();
            const fieldId = input.id;
            
            switch (fieldId) {
                case 'name':
                    if (value.length < 2) {
                        utils.showError(fieldId, 'Name must be at least 2 characters long');
                    } else {
                        utils.hideError(fieldId);
                    }
                    break;
                    
                case 'email':
                    if (!utils.validateEmail(value)) {
                        utils.showError(fieldId, 'Please enter a valid email address');
                    } else {
                        utils.hideError(fieldId);
                    }
                    break;
                    
                case 'subject':
                    if (value.length < 3) {
                        utils.showError(fieldId, 'Subject must be at least 3 characters long');
                    } else {
                        utils.hideError(fieldId);
                    }
                    break;
                    
                case 'message':
                    if (value.length < 10) {
                        utils.showError(fieldId, 'Message must be at least 10 characters long');
                    } else {
                        utils.hideError(fieldId);
                    }
                    break;
            }
        },

        submitForm: (data) => {
            const submitButton = elements.contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.innerHTML;
            
            // Show loading state
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission
            setTimeout(() => {
                // Reset form
                elements.contactForm.reset();
                
                // Show success message
                submitButton.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
                submitButton.style.background = 'var(--success-color)';
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 3000);
                
                // Show success notification
                formHandler.showNotification('Message sent successfully!', 'success');
            }, 2000);
        },

        showNotification: (message, type = 'info') => {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            `;
            
            // Add styles
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: type === 'success' ? 'var(--success-color)' : 'var(--accent-color)',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: '10000',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transform: 'translateX(100%)',
                transition: 'transform var(--transition-normal)'
            });
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
            
            // Remove after 5 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(notification);
                }, 300);
            }, 5000);
        }
    };

    // ===== INTERACTIVE FEATURES =====
    const interactiveFeatures = {
        init: () => {
            interactiveFeatures.initBackToTop();
            interactiveFeatures.initDownloadCV();
            interactiveFeatures.initProjectCards();
            interactiveFeatures.initContactItems();
        },

        initBackToTop: () => {
            if (elements.backToTop) {
                elements.backToTop.addEventListener('click', () => {
                    utils.smoothScrollTo('#home');
                });
            }
        },

        initDownloadCV: () => {
            if (elements.downloadCv) {
                elements.downloadCv.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Create notification for demo purposes
                    formHandler.showNotification('CV download will be available soon!', 'info');
                    
                    // In a real implementation, you would link to an actual CV file
                    // window.open('path/to/your-cv.pdf', '_blank');
                });
            }
        },

        initProjectCards: () => {
            const projectCards = document.querySelectorAll('.project-card');
            
            projectCards.forEach(card => {
                const overlay = card.querySelector('.project-overlay');
                
                card.addEventListener('mouseenter', () => {
                    if (overlay) overlay.style.opacity = '1';
                });
                
                card.addEventListener('mouseleave', () => {
                    if (overlay) overlay.style.opacity = '0';
                });
            });
        },

        initContactItems: () => {
            const contactItems = document.querySelectorAll('.contact-item');
            
            contactItems.forEach(item => {
                item.addEventListener('click', () => {
                    const emailElement = item.querySelector('p');
                    if (emailElement && emailElement.textContent.includes('@')) {
                        window.location.href = `mailto:${emailElement.textContent}`;
                    }
                });
            });
        }
    };

    // ===== PERFORMANCE OPTIMIZATION =====
    const performance = {
        init: () => {
            performance.lazyLoadImages();
            performance.prefetchResources();
        },

        lazyLoadImages: () => {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.classList.remove('lazy');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }
        },

        prefetchResources: () => {
            // Prefetch critical resources
            const resources = [
                'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
            ];

            resources.forEach(resource => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = resource;
                document.head.appendChild(link);
            });
        }
    };

    // ===== ACCESSIBILITY =====
    const accessibility = {
        init: () => {
            accessibility.initKeyboardNavigation();
            accessibility.initFocusManagement();
            accessibility.initAriaLabels();
        },

        initKeyboardNavigation: () => {
            // Tab navigation for custom elements
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.body.classList.add('keyboard-navigation');
                }
            });

            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-navigation');
            });
        },

        initFocusManagement: () => {
            // Skip to main content link
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = 'Skip to main content';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: var(--accent-color);
                color: white;
                padding: 8px;
                text-decoration: none;
                border-radius: 4px;
                z-index: 10000;
                transition: top 0.3s;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });
            
            document.body.insertBefore(skipLink, document.body.firstChild);
        },

        initAriaLabels: () => {
            // Add ARIA labels to interactive elements
            const hamburger = document.getElementById('hamburger');
            if (hamburger) {
                hamburger.setAttribute('aria-label', 'Toggle navigation menu');
                hamburger.setAttribute('aria-expanded', 'false');
            }

            const backToTop = document.getElementById('back-to-top');
            if (backToTop) {
                backToTop.setAttribute('aria-label', 'Back to top');
            }

            // Update ARIA states
            document.addEventListener('click', () => {
                if (hamburger) {
                    hamburger.setAttribute('aria-expanded', state.isMenuOpen.toString());
                }
            });
        }
    };

    // ===== MAIN INITIALIZATION =====
    const app = {
        init: () => {
            // Check if DOM is ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', app.start);
            } else {
                app.start();
            }
        },

        start: () => {
            try {
                // Initialize all modules
                loadingScreen.init();
                navigation.init();
                animations.init();
                formHandler.init();
                interactiveFeatures.init();
                performance.init();
                accessibility.init();

                // Set initial state
                navigation.setActiveLink('home');
                
                console.log('Portfolio website initialized successfully!');
            } catch (error) {
                console.error('Error initializing portfolio website:', error);
            }
        }
    };

    // ===== ERROR HANDLING =====
    window.addEventListener('error', (e) => {
        console.error('JavaScript error:', e.error);
    });

    window.addEventListener('unhandledrejection', (e) => {
        console.error('Unhandled promise rejection:', e.reason);
    });

    // ===== START APPLICATION =====
    app.init();

})();