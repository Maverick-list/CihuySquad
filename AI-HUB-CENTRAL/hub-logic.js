/**
 * AI Hub Central - Hub Logic
 * 
 * Handles splash screen animations, navigation, and project loading
 * with smooth transitions and iframe-based project embedding.
 */

const HubLogic = {
    // Project configurations
    projects: {
        greenvision: {
            id: 'greenvision',
            name: 'GreenVision AI',
            subtitle: 'Climate & Environment',
            description: 'Platform AI untuk aksi iklim dan monitoring lingkungan real-time.',
            icon: '🌱',
            url: 'http://localhost:5173',
            color: '#10b981'
        },
        sehatku: {
            id: 'sehatku',
            name: 'SehatKu AI',
            subtitle: 'Healthcare & Wellness',
            description: 'Asisten kesehatan cerdas dengan Llama 3.2 untuk diagnosis awal dan konsultasi.',
            icon: '🏥',
            url: 'http://localhost:8000',
            color: '#6366f1'
        },
        educerdas: {
            id: 'educerdas',
            name: 'EduCerdas AI',
            subtitle: 'Personalized Learning',
            description: 'Platform pembelajaran adaptif dengan mode aksesibilitas untuk semua.',
            icon: '🎓',
            url: 'http://localhost:8001',
            color: '#8b5cf6'
        },
        infravision: {
            id: 'infravision',
            name: 'InfraVision AI',
            subtitle: 'Infrastructure Priority',
            description: 'Sistem prioritas pembangunan infrastruktur berbasis AI yang objektif.',
            icon: '🏗️',
            url: 'http://localhost:5174',
            color: '#f59e0b'
        }
    },

    // State
    currentProject: null,
    isInitialized: false,

    /**
     * Initialize the hub
     */
    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        console.log('🚀 AI Hub Central initializing...');

        // Start with splash screen
        this.showSplashScreen();

        // Setup event listeners
        this.setupEventListeners();
    },

    /**
     * Show and animate splash screen
     */
    showSplashScreen() {
        const splash = document.getElementById('splash-screen');
        const hub = document.getElementById('hub-container');

        if (!splash || !hub) return;

        // Hide hub initially
        hub.classList.remove('visible');

        // Wait for splash animation to complete (3 seconds)
        setTimeout(() => {
            splash.classList.add('fade-out');

            // Show hub after fade
            setTimeout(() => {
                hub.classList.add('visible');
                splash.style.display = 'none';
                console.log('✅ AI Hub Central ready');
            }, 800);
        }, 3000);
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Card click handlers
        document.querySelectorAll('.ai-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const projectId = card.dataset.project;
                if (projectId) {
                    this.openProject(projectId);
                }
            });
        });

        // Back button handler
        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.closeProject());
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentProject) {
                this.closeProject();
            }
        });
    },

    /**
     * Open a project in iframe view
     * @param {string} projectId - Project identifier
     */
    openProject(projectId) {
        const project = this.projects[projectId];
        if (!project) {
            console.error(`Project ${projectId} not found`);
            return;
        }

        console.log(`📂 Opening project: ${project.name}`);

        const projectView = document.getElementById('project-view');
        const projectTitle = document.getElementById('project-title');
        const projectFrame = document.getElementById('project-frame');

        if (!projectView || !projectFrame) return;

        // Update project view
        projectTitle.innerHTML = `${project.icon} ${project.name}`;
        projectFrame.src = project.url;

        // Show project view with animation
        projectView.classList.add('active');
        this.currentProject = projectId;

        // Update URL hash for deep linking
        history.pushState({ project: projectId }, project.name, `#${projectId}`);
    },

    /**
     * Close current project and return to hub
     */
    closeProject() {
        console.log('🔙 Returning to hub');

        const projectView = document.getElementById('project-view');
        const projectFrame = document.getElementById('project-frame');

        if (!projectView) return;

        // Hide project view
        projectView.classList.remove('active');

        // Clear iframe after animation
        setTimeout(() => {
            if (projectFrame) {
                projectFrame.src = 'about:blank';
            }
        }, 400);

        this.currentProject = null;

        // Clear URL hash
        history.pushState({}, 'AI Hub Central', '#');
    },

    /**
     * Handle browser back/forward navigation
     */
    handlePopState(event) {
        if (event.state && event.state.project) {
            this.openProject(event.state.project);
        } else if (this.currentProject) {
            this.closeProject();
        }
    },

    /**
     * Check URL hash on load for deep linking
     */
    checkDeepLink() {
        const hash = window.location.hash.slice(1);
        if (hash && this.projects[hash]) {
            // Wait for hub to be visible first
            setTimeout(() => {
                this.openProject(hash);
            }, 3500); // After splash screen
        }
    },

    /**
     * Skip splash screen (for development)
     */
    skipSplash() {
        const splash = document.getElementById('splash-screen');
        const hub = document.getElementById('hub-container');

        if (splash) {
            splash.style.display = 'none';
        }
        if (hub) {
            hub.classList.add('visible');
        }
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    HubLogic.init();
    HubLogic.checkDeepLink();
});

// Handle browser navigation
window.addEventListener('popstate', (e) => HubLogic.handlePopState(e));

// Expose to window for debugging
window.HubLogic = HubLogic;
