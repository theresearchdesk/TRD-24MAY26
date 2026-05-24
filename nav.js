function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;
    
    if (navLinks) {
        const isActive = navLinks.classList.toggle('active');
        if (body) {
            if (isActive) {
                body.classList.add('menu-open');
            } else {
                body.classList.remove('menu-open');
            }
        }
        if (menuToggle) {
            menuToggle.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        }
    }
}

function closeMenu() {
    const navLinks = document.getElementById('navLinks');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navLinks && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        document.body.classList.remove('menu-open');
    }
}

function initMenuEvents() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) return;

    if (menuToggle.getAttribute('data-nav-bound') === 'true') return;
    menuToggle.setAttribute('data-nav-bound', 'true');

    menuToggle.addEventListener('pointerup', () => {
        toggleMenu();
    }, { passive: true });

    menuToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
}

// Document-level clean click events to close menu when clicking outside or clicking anchor links
document.addEventListener('click', (e) => {
    const navLinks = document.getElementById('navLinks');
    
    if (navLinks && navLinks.classList.contains('active') && !e.target.closest('#navLinks') && !e.target.closest('.menu-toggle')) {
        closeMenu();
        return;
    }

    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        const href = anchor.getAttribute('href');
        if (href !== '#' && href.length > 1) {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                closeMenu();
                
                // Allow overflow changes and DOM layout to settle to prevent mobile scroll jumps
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const targetOffset = target.getBoundingClientRect().top + window.pageYOffset;
                        window.scrollTo({ top: targetOffset - 100, behavior: 'smooth' });
                    }, 10);
                });
            }
        }
    }
});

// Run binding as soon as DOM loads, or if header was fetched dynamically
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initMenuEvents);
} else {
    initMenuEvents();
}

