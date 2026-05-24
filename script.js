window.TRD = window.TRD || { initialized: false };

function toggleFAQ(element) {
    if (!element || typeof element.closest !== 'function') return;

    const faqItem = element.closest('.faq-item');
    if (!faqItem) return;

    const isActive = faqItem.classList.contains('active');
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => item.classList.remove('active'));
    if (!isActive) faqItem.classList.add('active');
}

function initHeaderScrollState() {
    const header = document.getElementById('header');
    if (!header) return;

    function updateHeaderState() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    updateHeaderState();
    window.addEventListener('scroll', updateHeaderState, { passive: true });
}

function initLazyThirdParty() {
    const lazyScripts = document.querySelectorAll('script[data-lazy-src]');
    const hasDeferredWidget = typeof window.initWhatsAppWidget === 'function';
    if (lazyScripts.length === 0 && !hasDeferredWidget) return;

    const loadLazy = () => {
        setTimeout(() => {
            lazyScripts.forEach(script => {
                const src = script.getAttribute('data-lazy-src');
                if (!src || !script.parentNode) return;

                const newScript = document.createElement('script');
                newScript.src = src;
                newScript.async = true;

                Array.from(script.attributes).forEach(attr => {
                    if (attr.name !== 'data-lazy-src' && attr.name !== 'src') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                });

                script.parentNode.replaceChild(newScript, script);
            });

            if (typeof window.initWhatsAppWidget === 'function') {
                try {
                    window.initWhatsAppWidget();
                } catch (err) {
                    console.warn('Deferred WhatsApp widget loading failed:', err);
                }
            }
        }, 2000);
    };

    if (document.readyState === 'complete') {
        loadLazy();
    } else {
        window.addEventListener('load', loadLazy, { passive: true, once: true });
    }
}

function highlightActiveTab() {
    const navLinksContainer = document.querySelector('.nav-links');
    if (!navLinksContainer) return;

    const navLinks = navLinksContainer.querySelectorAll('a');
    if (navLinks.length === 0) return;

    let currentPath = window.location.pathname;

    if (currentPath.endsWith('/index.html')) currentPath = currentPath.replace('/index.html', '');
    if (currentPath.endsWith('/') && currentPath.length > 1) currentPath = currentPath.slice(0, -1);
    if (currentPath === '') currentPath = '/';

    navLinks.forEach(link => {
        link.classList.remove('active', 'current');
    });

    navLinks.forEach(link => {
        let linkPath = new URL(link.href, window.location.origin).pathname;

        if (linkPath.endsWith('/index.html')) linkPath = linkPath.replace('/index.html', '');
        if (linkPath.endsWith('/') && linkPath.length > 1) linkPath = linkPath.slice(0, -1);
        if (linkPath === '') linkPath = '/';

        if (currentPath === linkPath) {
            link.classList.add('active');
        } else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
            link.classList.add('active');
        }
    });
}

function initScrollStagger() {
    const isMobile = window.matchMedia('(max-width: 968px)').matches;
    if (isMobile) {
        const allItems = document.querySelectorAll(
            '.portfolio-card, .faq-item, .trust-card, .stat-block, .perk-card, .process-step, .testimonial-card, .reveal-on-scroll'
        );
        allItems.forEach(item => {
            item.classList.add('revealed', 'visible');
        });
        return;
    }

    const allItems = document.querySelectorAll(
        '.portfolio-card, .faq-item, .trust-card, .stat-block, .perk-card, .process-step, .testimonial-card'
    );
    if (allItems.length === 0) return;

    if (typeof IntersectionObserver !== 'function') {
        allItems.forEach(item => {
            item.classList.add('revealed', 'visible');
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed', 'visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });

    const containers = document.querySelectorAll(
        '.portfolio-grid, .testimonials-grid, .stats-strip, .faq-container, .process-grid, .perks-grid, .portals-grid, .trust-grid, .subjects-grid'
    );

    containers.forEach(container => {
        const revealableItems = container.querySelectorAll(
            '.portfolio-card, .faq-item, .trust-card, .stat-block, .perk-card, .process-step, .testimonial-card'
        );

        revealableItems.forEach((item, index) => {
            item.classList.add('reveal-on-scroll');
            item.style.setProperty('--reveal-delay', `${index * 65}ms`);
            observer.observe(item);
        });
    });

    allItems.forEach(item => {
        if (!item.classList.contains('reveal-on-scroll')) {
            item.classList.add('reveal-on-scroll');
            observer.observe(item);
        }
    });
}

function initMagneticGlow() {
    const firstCard = document.querySelector('.portfolio-card, .trust-card, .perk-card, .process-step, .portal-card, .testimonial-card');
    if (!firstCard) return;

    const cards = document.querySelectorAll('.portfolio-card, .trust-card, .perk-card, .process-step, .portal-card, .testimonial-card');
    if (cards.length === 0) return;

    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const offsetX = x - centerX;
            const offsetY = y - centerY;
            const rotateX = -(offsetY / centerY) * 8;
            const rotateY = (offsetX / centerX) * 8;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
            card.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        }, { passive: true });
    });
}

function initMagneticButtons() {
    const firstBtn = document.querySelector('.cta-button, .cta-button-outline, .submit-button, .whatsapp-float');
    if (!firstBtn) return;

    const magneticElements = document.querySelectorAll('.cta-button, .cta-button-outline, .submit-button, .whatsapp-float');
    if (magneticElements.length === 0) return;

    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const scale = el.classList.contains('whatsapp-float') ? 1.08 : 1.03;

            el.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0) scale(${scale})`;
            el.style.transition = 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)';
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate3d(0, 0, 0) scale(1)';
            el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        }, { passive: true });
    });
}

function initAmbientOrbs() {
    if (!document.body) return;

    let orbContainer = document.querySelector('.orb-container');
    if (!orbContainer) {
        orbContainer = document.createElement('div');
        orbContainer.className = 'orb-container';
        document.body.appendChild(orbContainer);
    }

    orbContainer.innerHTML = [
        '<div class="ambient-orb orb-1"></div>',
        '<div class="ambient-orb orb-2"></div>'
    ].join('');
}

function applyPageTheme() {
    const root = document.documentElement;
    if (!root) return;

    const path = window.location.pathname.toLowerCase();
    let accent = '#94a3b8';
    let accentRgb = '148, 163, 184';
    let orb1 = 'rgba(148, 163, 184, 0.08)';
    let orb2 = 'rgba(100, 116, 139, 0.06)';

    if (path.includes('/assignment-help')) {
        accent = '#10b981';
        accentRgb = '16, 185, 129';
        orb1 = 'rgba(16, 185, 129, 0.08)';
        orb2 = 'rgba(20, 184, 166, 0.06)';
    } else if (path.includes('/technical-solutions')) {
        accent = '#8b5cf6';
        accentRgb = '139, 92, 246';
        orb1 = 'rgba(139, 92, 246, 0.08)';
        orb2 = 'rgba(59, 130, 246, 0.06)';
    } else if (path.includes('/earn-with-us')) {
        accent = '#f59e0b';
        accentRgb = '245, 158, 11';
        orb1 = 'rgba(245, 158, 11, 0.08)';
        orb2 = 'rgba(249, 115, 22, 0.06)';
    } else if (path.includes('/contact-us')) {
        accent = '#f97316';
        accentRgb = '249, 115, 22';
        orb1 = 'rgba(249, 115, 22, 0.08)';
        orb2 = 'rgba(239, 68, 68, 0.06)';
    } else if (path.includes('/portals')) {
        accent = '#14b8a6';
        accentRgb = '20, 184, 166';
        orb1 = 'rgba(20, 184, 166, 0.08)';
        orb2 = 'rgba(16, 185, 129, 0.06)';
    } else if (path.includes('/client-portal') || path.includes('/writer-portal')) {
        accent = '#3b82f6';
        accentRgb = '59, 130, 246';
        orb1 = 'rgba(59, 130, 246, 0.08)';
        orb2 = 'rgba(99, 102, 241, 0.06)';
    }

    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-rgb', accentRgb);
    root.style.setProperty('--orb-1-color', orb1);
    root.style.setProperty('--orb-2-color', orb2);

    initAmbientOrbs();
}

function initWordSlider() {
    const container = document.querySelector('.slider-word-container');
    if (!container) return;

    const activeWord = container.querySelector('.slider-word.active');
    if (!activeWord) return;

    const words = ['Handle', 'Automate', 'Write', 'Code', 'Solve'];
    let currentIdx = Math.max(0, words.indexOf(activeWord.textContent.trim()));

    setInterval(() => {
        const currentWord = container.querySelector('.slider-word.active');
        if (!currentWord) return;

        currentIdx = (currentIdx + 1) % words.length;

        const nextWord = document.createElement('span');
        nextWord.className = 'slider-word';
        nextWord.textContent = words[currentIdx];

        container.style.width = `${currentWord.offsetWidth}px`;
        container.appendChild(nextWord);

        const newWidth = nextWord.offsetWidth;
        nextWord.offsetHeight;
        container.style.width = `${newWidth}px`;

        currentWord.classList.remove('active');
        currentWord.classList.add('exit');
        nextWord.classList.add('active');

        setTimeout(() => {
            if (currentWord.parentNode === container) {
                container.removeChild(currentWord);
            }
            container.style.width = '';
        }, 350);
    }, 3000);
}

function formatStatValue(value, type) {
    if (type === 'percent') {
        return `${value.toFixed(1)}%`;
    }

    if (type === 'comma') {
        return Math.floor(value).toLocaleString();
    }

    return Math.floor(value).toString();
}

function initLiveCounters() {
    const hasCounter = document.querySelector('#stat-projects') || document.querySelector('#stat-students') || document.querySelector('#stat-accuracy') || document.querySelector('#stat-countries');
    if (!hasCounter) return;

    const counters = document.querySelectorAll('#stat-projects, #stat-students, #stat-accuracy, #stat-countries');
    if (counters.length === 0) return;

    const stats = [
        { id: 'stat-projects', target: 10482, current: 0, type: 'comma', interval: 8000, step: 1 },
        { id: 'stat-students', target: 2184, current: 0, type: 'comma', interval: 22000, step: 1 },
        { id: 'stat-accuracy', target: 99.4, current: 0, type: 'percent', interval: 0, step: 0 },
        { id: 'stat-countries', target: 42, current: 0, type: 'integer', interval: 0, step: 0 }
    ];
    const elements = [];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        if (!el) return;

        const rawText = el.textContent.trim();
        if (rawText.includes('%')) {
            stat.target = parseFloat(rawText.replace('%', ''));
            stat.type = 'percent';
        } else if (rawText.includes(',')) {
            stat.target = parseInt(rawText.replace(/,/g, ''), 10);
            stat.type = 'comma';
        } else {
            stat.target = parseInt(rawText, 10);
            stat.type = 'integer';
        }

        if (Number.isNaN(stat.target)) return;

        el.textContent = formatStatValue(0, stat.type);
        elements.push({ el, stat });
    });

    if (elements.length === 0) return;

    function setupLiveIncrement(el, stat) {
        if (stat.interval <= 0) return;

        setInterval(() => {
            stat.current += stat.step;

            const statBlock = el.closest('.stat-block') || el;
            statBlock.classList.remove('stat-pulse-active');
            statBlock.offsetHeight;
            statBlock.classList.add('stat-pulse-active');
            el.textContent = formatStatValue(stat.current, stat.type);

            setTimeout(() => {
                statBlock.classList.remove('stat-pulse-active');
            }, 800);
        }, stat.interval);
    }

    function animateCountUp() {
        const duration = 1500;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            elements.forEach(({ el, stat }) => {
                el.textContent = formatStatValue(easeProgress * stat.target, stat.type);
            });

            if (progress < 1) {
                requestAnimationFrame(update);
                return;
            }

            elements.forEach(({ el, stat }) => {
                stat.current = stat.target;
                el.textContent = formatStatValue(stat.target, stat.type);
                setupLiveIncrement(el, stat);
            });
        }

        requestAnimationFrame(update);
    }

    const statsContainer = document.querySelector('.stats-strip') || elements[0].el;
    if (!statsContainer) return;

    if (typeof IntersectionObserver !== 'function') {
        animateCountUp();
        return;
    }

    const countUpObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCountUp();
                observerInstance.disconnect();
            }
        });
    }, { threshold: 0.1 });

    countUpObserver.observe(statsContainer);
}

function initNavCapsule() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const links = navLinks.querySelectorAll('a');
    if (links.length === 0) return;

    const isHoverDevice = window.matchMedia('(hover: hover)').matches;
    if (!isHoverDevice) return;

    let pill = navLinks.querySelector('.nav-hover-pill');
    if (!pill) {
        pill = document.createElement('div');
        pill.className = 'nav-hover-pill';
        navLinks.appendChild(pill);
    }

    function positionPill(a) {
        if (!a) {
            pill.style.opacity = '0';
            return;
        }

        pill.style.left = `${a.offsetLeft}px`;
        pill.style.width = `${a.offsetWidth}px`;
        pill.style.height = `${a.offsetHeight}px`;
        pill.style.opacity = '1';
    }

    const activeLink = navLinks.querySelector('a.active');
    if (activeLink) {
        setTimeout(() => positionPill(activeLink), 150);
    }

    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            positionPill(link);
        }, { passive: true });
    });

    navLinks.addEventListener('mouseleave', () => {
        const currentActive = navLinks.querySelector('a.active');
        if (currentActive) {
            positionPill(currentActive);
        } else {
            pill.style.opacity = '0';
        }
    }, { passive: true });
}



function runTRDInitializers() {
    if (window.TRD.initialized) return;
    window.TRD.initialized = true;

    if (typeof highlightActiveTab === 'function') highlightActiveTab();
    if (typeof applyPageTheme === 'function') applyPageTheme();
    if (typeof initHeaderScrollState === 'function') initHeaderScrollState();
    if (typeof initWordSlider === 'function') initWordSlider();
    if (typeof initNavCapsule === 'function') initNavCapsule();
    if (typeof initLazyThirdParty === 'function') initLazyThirdParty();

    setTimeout(() => {
        if (typeof initMagneticGlow === 'function') initMagneticGlow();
        if (typeof initScrollStagger === 'function') initScrollStagger();
        if (typeof initLiveCounters === 'function') initLiveCounters();
        if (typeof initMagneticButtons === 'function') initMagneticButtons();
    }, 30);
}

window.addEventListener('DOMContentLoaded', runTRDInitializers, { once: true });

if (document.readyState !== 'loading') {
    runTRDInitializers();
}
