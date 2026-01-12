/**
 * Visual Storytelling Animations
 * 
 * Modul untuk scroll-based animations pada storytelling page.
 * Menggunakan Intersection Observer dengan error handling yang robust.
 * 
 * © 2026 SehatKu AI - Hackathon Ready
 */

// ==================== STORYTELLING ANIMATIONS ====================

/**
 * Initialize storytelling animations dengan error handling
 */
window.initStorytellingAnimations = function() {
    try {
        console.log('🎬 Initializing Storytelling Animations...');

        const sections = document.querySelectorAll('.story-section');
        const scrollIndicator = document.querySelector('.scroll-indicator');

        if (sections.length === 0) {
            console.warn('⚠️ No story sections found, skipping animation');
            enterMainApp();
            return;
        }

        // Intersection Observer options
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.3
        };

        // Callback untuk intersection
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    if (scrollIndicator && entry.target.dataset.story !== 'intro') {
                        scrollIndicator.classList.add('hidden');
                    }
                }
            });
        };

        // Create observer
        let observer;
        try {
            observer = new IntersectionObserver(observerCallback, observerOptions);
        } catch (e) {
            console.warn('⚠️ IntersectionObserver not supported, using fallback');
            sections.forEach((section, index) => {
                setTimeout(() => section.classList.add('visible'), index * 500);
            });
            return;
        }

        // Observe sections
        sections.forEach(section => {
            try { observer.observe(section); } catch (e) { console.warn('⚠️ Failed to observe section'); }
        });

        // Auto-show first section
        if (sections.length > 0) {
            setTimeout(() => { try { sections[0].classList.add('visible'); } catch (e) {} }, 300);
        }

        // Hide scroll indicator saat scroll
        let scrollTimeout;
        const storytellingPage = document.getElementById('storytelling-page');

        if (storytellingPage) {
            storytellingPage.addEventListener('scroll', () => {
                try {
                    if (scrollIndicator) scrollIndicator.style.opacity = '0';
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        if (scrollIndicator && storytellingPage.scrollTop < 100) {
                            scrollIndicator.style.opacity = '1';
                        }
                    }, 1000);
                } catch (e) { console.warn('⚠️ Scroll handler error'); }
            });
        }

        console.log('✅ Storytelling Animations initialized');
    } catch (error) {
        console.error('❌ Storytelling init error:', error);
        enterMainApp();
    }
};

/**
 * Enter main app dari storytelling page
 */
window.enterMainApp = function() {
    try {
        console.log('🚀 Entering main app...');

        const storytellingPage = document.getElementById('storytelling-page');
        const mainContent = document.getElementById('mainContent');

        if (!storytellingPage) {
            if (mainContent) {
                mainContent.classList.remove('hidden');
                mainContent.classList.add('visible');
            }
            return;
        }

        storytellingPage.classList.add('fade-out');

        setTimeout(() => {
            try {
                storytellingPage.classList.add('hidden');
                storytellingPage.classList.remove('fade-out');

                if (mainContent) {
                    mainContent.classList.remove('hidden');
                    setTimeout(() => mainContent.classList.add('visible'), 50);
                }

                console.log('✅ Main app loaded successfully');
            } catch (e) {
                console.error('❌ Error showing main app:', e);
            }
        }, 600);
    } catch (error) {
        console.error('❌ enterMainApp error:', error);
        // Force show main app
        const mainContent = document.getElementById('mainContent');
        const storytellingPage = document.getElementById('storytelling-page');
        if (mainContent) {
            mainContent.classList.remove('hidden');
            mainContent.classList.add('visible');
        }
        if (storytellingPage) {
            storytellingPage.classList.add('hidden');
        }
    }
};

