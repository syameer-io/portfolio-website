// ===== PORTFOLIO WEBSITE — ENHANCED JAVASCRIPT =====

(function () {
    'use strict';

    // ===== CONSTANTS =====
    const LOADING_DURATION = 2200;
    const SCROLL_THRESHOLD = 100;
    const PARTICLE_COUNT = 60;
    const CONNECTION_DISTANCE = 120;

    // ===== DOM REFS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const el = {
        loadingScreen: $('#loading-screen'),
        navbar: $('#navbar'),
        hamburger: $('#hamburger'),
        mobileMenu: $('#mobile-menu'),
        navLinks: $$('.nav-link'),
        mobileLinks: $$('.mobile-link'),
        backToTop: $('#back-to-top'),
        contactForm: $('#contact-form'),
        downloadCv: $('#download-cv'),
        heroCanvas: $('#hero-canvas'),
        heroName: $('#hero-name'),
        cursorDot: $('#cursor-dot'),
        cursorRing: $('#cursor-ring'),
        sections: $$('section[id]'),
        skillChips: $$('.skill-chip'),
        reveals: $$('.reveal'),
    };

    // ===== STATE =====
    const state = {
        isLoading: true,
        menuOpen: false,
        currentSection: 'home',
        scrolled: false,
        skillsAnimated: false,
        mouseX: 0,
        mouseY: 0,
        cursorX: 0,
        cursorY: 0,
        ringX: 0,
        ringY: 0,
    };

    // ===== UTILS =====
    const throttle = (fn, delay) => {
        let last = 0;
        return function (...args) {
            const now = Date.now();
            if (now - last >= delay) {
                last = now;
                fn.apply(this, args);
            }
        };
    };

    const smoothScrollTo = (target) => {
        const el = document.querySelector(target);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    // ===== LOADING SCREEN =====
    const loading = {
        init() {
            setTimeout(() => {
                if (el.loadingScreen) {
                    el.loadingScreen.classList.add('hidden');
                    state.isLoading = false;
                    setTimeout(() => {
                        el.loadingScreen.style.display = 'none';
                    }, 600);
                }
            }, LOADING_DURATION);
        },
    };

    // ===== CUSTOM CURSOR =====
    const cursor = {
        init() {
            if (!el.cursorDot || !el.cursorRing) return;
            if (window.matchMedia('(hover: none)').matches) return;

            document.addEventListener('mousemove', (e) => {
                state.mouseX = e.clientX;
                state.mouseY = e.clientY;
            });

            // Hover targets
            const hoverTargets = 'a, button, .project-card, .bento-card, .skill-chip, .contact-item, .social-link, input, textarea';
            document.addEventListener('mouseover', (e) => {
                if (e.target.closest(hoverTargets)) {
                    el.cursorRing.classList.add('hovering');
                }
            });
            document.addEventListener('mouseout', (e) => {
                if (e.target.closest(hoverTargets)) {
                    el.cursorRing.classList.remove('hovering');
                }
            });

            cursor.animate();
        },

        animate() {
            // Smooth follow for dot
            state.cursorX += (state.mouseX - state.cursorX) * 0.2;
            state.cursorY += (state.mouseY - state.cursorY) * 0.2;
            el.cursorDot.style.left = state.cursorX + 'px';
            el.cursorDot.style.top = state.cursorY + 'px';

            // Slower follow for ring
            state.ringX += (state.mouseX - state.ringX) * 0.08;
            state.ringY += (state.mouseY - state.ringY) * 0.08;
            el.cursorRing.style.left = state.ringX + 'px';
            el.cursorRing.style.top = state.ringY + 'px';

            requestAnimationFrame(() => cursor.animate());
        },
    };

    // ===== PARTICLE CANVAS =====
    const particles = {
        list: [],
        ctx: null,
        w: 0,
        h: 0,

        init() {
            const canvas = el.heroCanvas;
            if (!canvas) return;
            // Skip particles on mobile for performance
            if (window.innerWidth < 768) return;

            this.ctx = canvas.getContext('2d');
            this.resize();
            this.create();
            this.animate();

            window.addEventListener('resize', throttle(() => this.resize(), 200));
        },

        resize() {
            const canvas = el.heroCanvas;
            const hero = canvas.parentElement.parentElement;
            this.w = canvas.width = hero.offsetWidth;
            this.h = canvas.height = hero.offsetHeight;
        },

        create() {
            this.list = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                this.list.push({
                    x: Math.random() * this.w,
                    y: Math.random() * this.h,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.5 + 0.2,
                });
            }
        },

        animate() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, this.w, this.h);

            // Update & draw particles
            for (const p of this.list) {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = this.w;
                if (p.x > this.w) p.x = 0;
                if (p.y < 0) p.y = this.h;
                if (p.y > this.h) p.y = 0;

                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha})`;
                this.ctx.fill();
            }

            // Draw connections
            for (let i = 0; i < this.list.length; i++) {
                for (let j = i + 1; j < this.list.length; j++) {
                    const a = this.list[i];
                    const b = this.list[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONNECTION_DISTANCE) {
                        const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                        this.ctx.beginPath();
                        this.ctx.moveTo(a.x, a.y);
                        this.ctx.lineTo(b.x, b.y);
                        this.ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                        this.ctx.lineWidth = 0.5;
                        this.ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(() => this.animate());
        },
    };

    // ===== NAVIGATION =====
    const nav = {
        init() {
            // Hamburger
            if (el.hamburger) {
                el.hamburger.addEventListener('click', nav.toggleMenu);
            }

            // Nav links
            el.navLinks.forEach((link) => {
                link.addEventListener('click', nav.handleClick);
            });

            // Mobile links
            el.mobileLinks.forEach((link) => {
                link.addEventListener('click', nav.handleClick);
            });

            // Scroll
            window.addEventListener('scroll', throttle(nav.onScroll, 16));

            // Close on ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.menuOpen) nav.closeMenu();
            });

            // Close on outside click
            document.addEventListener('click', (e) => {
                if (
                    state.menuOpen &&
                    el.mobileMenu &&
                    !el.mobileMenu.contains(e.target) &&
                    !el.hamburger.contains(e.target)
                ) {
                    nav.closeMenu();
                }
            });
        },

        toggleMenu() {
            state.menuOpen = !state.menuOpen;
            el.hamburger.classList.toggle('active', state.menuOpen);
            el.hamburger.setAttribute('aria-expanded', state.menuOpen);
            el.mobileMenu.classList.toggle('active', state.menuOpen);
            document.body.style.overflow = state.menuOpen ? 'hidden' : '';
        },

        closeMenu() {
            state.menuOpen = false;
            el.hamburger.classList.remove('active');
            el.hamburger.setAttribute('aria-expanded', 'false');
            el.mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        },

        handleClick(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                smoothScrollTo(href);
                nav.closeMenu();
                nav.setActive(href.substring(1));
            }
        },

        onScroll() {
            const y = window.scrollY;

            // Navbar style
            if (y > 50 && !state.scrolled) {
                el.navbar.classList.add('scrolled');
                state.scrolled = true;
            } else if (y <= 50 && state.scrolled) {
                el.navbar.classList.remove('scrolled');
                state.scrolled = false;
            }

            // Back to top
            if (el.backToTop) {
                el.backToTop.classList.toggle('show', y > SCROLL_THRESHOLD);
            }

            // Active section
            nav.updateActive();
        },

        updateActive() {
            let current = '';
            const scrollY = window.scrollY;

            el.sections.forEach((sec) => {
                const top = sec.getBoundingClientRect().top + scrollY - 120;
                const height = sec.offsetHeight;
                if (scrollY >= top && scrollY < top + height) {
                    current = sec.id;
                }
            });

            if (current && current !== state.currentSection) {
                nav.setActive(current);
                state.currentSection = current;
            }
        },

        setActive(id) {
            el.navLinks.forEach((link) => {
                link.classList.toggle('active', link.dataset.section === id);
            });
            el.mobileLinks.forEach((link) => {
                link.classList.toggle('active', link.dataset.section === id);
            });
        },
    };

    // ===== SCROLL REVEAL =====
    const reveal = {
        init() {
            if (!('IntersectionObserver' in window)) {
                el.reveals.forEach((r) => r.classList.add('visible'));
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');

                            // Trigger skill chips animation
                            if (
                                entry.target.closest('#skills') &&
                                !state.skillsAnimated
                            ) {
                                setTimeout(skills.animate, 300);
                                state.skillsAnimated = true;
                            }
                        }
                    });
                },
                { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
            );

            el.reveals.forEach((r) => observer.observe(r));
        },
    };

    // ===== SKILL CHIPS =====
    const skills = {
        animate() {
            el.skillChips.forEach((chip, i) => {
                setTimeout(() => {
                    chip.classList.add('animated');
                }, i * 80);
            });
        },
    };

    // ===== TYPING EFFECT =====
    const typing = {
        init() {
            if (!el.heroName) return;
            const text = el.heroName.textContent;
            el.heroName.textContent = '';
            el.heroName.style.borderRight = '2px solid var(--blue-400)';

            let i = 0;
            const type = () => {
                if (i < text.length) {
                    el.heroName.textContent += text.charAt(i);
                    i++;
                    setTimeout(type, 90);
                } else {
                    // Blink cursor then remove
                    setTimeout(() => {
                        el.heroName.style.borderRight = 'none';
                    }, 1500);
                }
            };

            // Start after loading screen
            setTimeout(type, LOADING_DURATION + 200);
        },
    };

    // ===== FORM HANDLER =====
    const form = {
        init() {
            if (!el.contactForm) return;

            el.contactForm.addEventListener('submit', form.handleSubmit);

            // Real-time validation
            el.contactForm.querySelectorAll('.form-input').forEach((input) => {
                input.addEventListener('blur', () => form.validateField(input));
                input.addEventListener('input', () => form.hideError(input.id));
            });
        },

        validateEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        showError(id, msg) {
            const err = document.getElementById(`${id}-error`);
            const inp = document.getElementById(id);
            if (err && inp) {
                err.textContent = msg;
                err.classList.add('show');
                inp.style.borderColor = 'var(--error)';
            }
        },

        hideError(id) {
            const err = document.getElementById(`${id}-error`);
            const inp = document.getElementById(id);
            if (err && inp) {
                err.classList.remove('show');
                inp.style.borderColor = '';
            }
        },

        validateField(input) {
            const v = input.value.trim();
            const id = input.id;
            if (id === 'name' && v.length < 2) {
                form.showError(id, 'Name must be at least 2 characters');
            } else if (id === 'email' && !form.validateEmail(v)) {
                form.showError(id, 'Please enter a valid email');
            } else if (id === 'subject' && v.length < 3) {
                form.showError(id, 'Subject must be at least 3 characters');
            } else if (id === 'message' && v.length < 10) {
                form.showError(id, 'Message must be at least 10 characters');
            }
        },

        validateForm(data) {
            let valid = true;
            if (!data.name || data.name.trim().length < 2) {
                form.showError('name', 'Name must be at least 2 characters');
                valid = false;
            } else form.hideError('name');

            if (!data.email || !form.validateEmail(data.email)) {
                form.showError('email', 'Please enter a valid email');
                valid = false;
            } else form.hideError('email');

            if (!data.subject || data.subject.trim().length < 3) {
                form.showError('subject', 'Subject must be at least 3 characters');
                valid = false;
            } else form.hideError('subject');

            if (!data.message || data.message.trim().length < 10) {
                form.showError('message', 'Message must be at least 10 characters');
                valid = false;
            } else form.hideError('message');

            return valid;
        },

        handleSubmit(e) {
            e.preventDefault();
            const fd = new FormData(el.contactForm);
            const data = Object.fromEntries(fd);

            if (!form.validateForm(data)) return;

            const btn = el.contactForm.querySelector('button[type="submit"]');
            const original = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Sending...</span>';
            btn.disabled = true;

            // Simulate send
            setTimeout(() => {
                el.contactForm.reset();
                btn.innerHTML = '<i class="fas fa-check"></i> <span>Message Sent!</span>';
                btn.style.background = 'var(--success)';

                form.notify('Message sent successfully!', 'success');

                setTimeout(() => {
                    btn.innerHTML = original;
                    btn.disabled = false;
                    btn.style.background = '';
                }, 3000);
            }, 2000);
        },

        notify(msg, type = 'info') {
            const n = document.createElement('div');
            n.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i><span>${msg}</span>`;
            Object.assign(n.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: type === 'success' ? 'var(--success)' : 'var(--blue-600)',
                color: '#fff',
                padding: '0.85rem 1.25rem',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                zIndex: '100001',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-body)',
                transform: 'translateX(120%)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            });

            document.body.appendChild(n);
            requestAnimationFrame(() => {
                n.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
                n.style.transform = 'translateX(120%)';
                setTimeout(() => n.remove(), 400);
            }, 4000);
        },
    };

    // ===== INTERACTIVE FEATURES =====
    const interactive = {
        init() {
            // Back to top
            if (el.backToTop) {
                el.backToTop.addEventListener('click', () => smoothScrollTo('#home'));
            }

            // Download CV - link is set directly in HTML with download attribute

            // Nav CTA
            const navCta = $('.nav-cta');
            if (navCta) {
                navCta.addEventListener('click', (e) => {
                    e.preventDefault();
                    smoothScrollTo('#contact');
                });
            }

            // Contact item click-to-email
            $$('.contact-item').forEach((item) => {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    const p = item.querySelector('p');
                    if (p && p.textContent.includes('@')) {
                        window.location.href = `mailto:${p.textContent}`;
                    }
                });
            });
        },
    };

    // ===== ACCESSIBILITY =====
    const a11y = {
        init() {
            // Keyboard navigation indicator
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') document.body.classList.add('keyboard-nav');
            });
            document.addEventListener('mousedown', () => {
                document.body.classList.remove('keyboard-nav');
            });

            // Skip link
            const skip = document.createElement('a');
            skip.href = '#home';
            skip.textContent = 'Skip to main content';
            Object.assign(skip.style, {
                position: 'absolute',
                top: '-40px',
                left: '8px',
                background: 'var(--blue-600)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '8px',
                zIndex: '100002',
                fontSize: '0.85rem',
                transition: 'top 0.3s ease',
                textDecoration: 'none',
            });
            skip.addEventListener('focus', () => (skip.style.top = '8px'));
            skip.addEventListener('blur', () => (skip.style.top = '-40px'));
            document.body.insertBefore(skip, document.body.firstChild);
        },
    };

    // ===== INIT =====
    const app = {
        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', app.start);
            } else {
                app.start();
            }
        },

        start() {
            try {
                loading.init();
                cursor.init();
                particles.init();
                nav.init();
                reveal.init();
                typing.init();
                form.init();
                interactive.init();
                a11y.init();
                nav.setActive('home');
            } catch (err) {
                console.error('Portfolio init error:', err);
            }
        },
    };

    // Global error handling
    window.addEventListener('error', (e) => console.error('JS error:', e.error));
    window.addEventListener('unhandledrejection', (e) => console.error('Promise rejection:', e.reason));

    app.init();
})();
