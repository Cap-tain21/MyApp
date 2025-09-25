// Web App Maker - Main JavaScript File
class WebAppMaker {
    constructor() {
        this.currentProject = null;
        this.savedProjects = JSON.parse(localStorage.getItem('webAppMakerProjects')) || [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadDefaultTemplate();
        this.renderProjects();
        this.initAPKExport();
    }

    // Initialize the application
    initializeApp() {
        console.log('🚀 Web App Maker Initialized');
        
        // Set dark mode if enabled
        if (this.isDarkMode) {
            this.toggleDarkMode();
        }
        
        // Show first tab
        this.showTab('editor');
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.getAttribute('data-tab');
                this.showTab(tab);
            });
        });

        // Editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const editor = e.target.getAttribute('data-editor');
                this.showEditor(editor);
            });
        });

        // Action buttons
        document.getElementById('runBtn').addEventListener('click', () => this.runPreview());
        document.getElementById('saveBtn').addEventListener('click', () => this.showSaveModal());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetEditors());
        document.getElementById('exportBtn').addEventListener('click', () => this.showAPKModal());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleDarkMode());
        document.getElementById('formatCode').addEventListener('click', () => this.formatCode());
        document.getElementById('refreshPreview').addEventListener('click', () => this.runPreview());
        document.getElementById('newProject').addEventListener('click', () => this.newProject());
        
        // Device size selector
        document.getElementById('deviceSize').addEventListener('change', (e) => {
            this.adjustPreviewSize(e.target.value);
        });

        // Modal events
        this.setupModalEvents();
        
        // Real-time code updates
        this.setupRealTimeUpdates();
        
        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    // ===== APK EXPORT FUNCTIONALITY =====
    initAPKExport() {
        const generateApkBtn = document.getElementById('generateApkBtn');
        const apkHelpBtn = document.getElementById('apkHelpBtn');

        // Generate APK button
        if (generateApkBtn) {
            generateApkBtn.addEventListener('click', () => {
                this.generateAPK();
            });
        }

        // APK Help button
        if (apkHelpBtn) {
            apkHelpBtn.addEventListener('click', () => {
                this.hideAPKModal();
                this.showAPKHelpModal();
            });
        }

        // Close modals when clicking X or outside
        this.setupModalClose('apkModal');
        this.setupModalClose('apkHelpModal');
    }

    showAPKModal() {
        const modal = document.getElementById('apkModal');
        if (modal) modal.style.display = 'block';
    }

    hideAPKModal() {
        const modal = document.getElementById('apkModal');
        if (modal) modal.style.display = 'none';
    }

    showAPKHelpModal() {
        const modal = document.getElementById('apkHelpModal');
        if (modal) modal.style.display = 'block';
    }

    setupModalClose(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    generateAPK() {
        const apkStatus = document.getElementById('apkStatus');
        const generateApkBtn = document.getElementById('generateApkBtn');
        
        if (!apkStatus || !generateApkBtn) return;
        
        // Show building status
        apkStatus.innerHTML = `
            <div style="color: #ffa726;">
                <i class="fas fa-cog fa-spin"></i>
                <strong> Building APK...</strong>
                <br><small>Redirecting to GitHub Actions</small>
            </div>
        `;
        
        // Disable button and show loading
        generateApkBtn.disabled = true;
        generateApkBtn.innerHTML = '<i class="fas fa-cog fa-spin"></i> Building...';
        
        // Open GitHub Actions after short delay
        setTimeout(() => {
            window.open('https://github.com/Cap-tan21/MyApp/actions/workflows/build-apk.yml', '_blank');
            
            // Show next steps
            apkStatus.innerHTML += `
                <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-radius: 5px; font-size: 14px;">
                    <strong>Next Steps:</strong><br>
                    1. Click "Run workflow" button<br>
                    2. Wait 2-3 minutes for build<br>
                    3. Download APK from Artifacts section
                </div>
            `;
            
            // Re-enable button after 3 seconds
            setTimeout(() => {
                generateApkBtn.disabled = false;
                generateApkBtn.innerHTML = '<i class="fas fa-robot"></i> Generate APK';
            }, 3000);
            
        }, 1500);
    }

    // Show/hide tabs
    showTab(tabName) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // If showing preview tab, run preview automatically
        if (tabName === 'preview') {
            setTimeout(() => this.runPreview(), 100);
        }
    }

    // Switch between code editors
    showEditor(editorName) {
        // Update editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-editor="${editorName}"]`).classList.add('active');

        // Show corresponding editor
        document.querySelectorAll('.code-editor').forEach(editor => {
            editor.classList.remove('active');
        });
        document.getElementById(`${editorName}-editor`).classList.add('active');
    }

    // Run code preview
    runPreview() {
        const html = document.getElementById('htmlCode').value;
        const css = document.getElementById('cssCode').value;
        const js = document.getElementById('jsCode').value;

        const previewFrame = document.getElementById('preview');
        const previewDocument = previewFrame.contentDocument || previewFrame.contentWindow.document;

        const previewHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>${css}</style>
            </head>
            <body>
                ${html}
                <script>${js}<\/script>
            </body>
            </html>
        `;

        previewDocument.open();
        previewDocument.write(previewHTML);
        previewDocument.close();

        this.showToast('Preview updated successfully!', 'success');
    }

    // Adjust preview frame size
    adjustPreviewSize(size) {
        const deviceFrame = document.getElementById('deviceFrame');
        const iframe = document.getElementById('preview');

        switch(size) {
            case 'mobile':
                deviceFrame.style.maxWidth = '360px';
                iframe.style.height = '600px';
                break;
            case 'tablet':
                deviceFrame.style.maxWidth = '768px';
                iframe.style.height = '1024px';
                break;
            case 'desktop':
                deviceFrame.style.maxWidth = '100%';
                iframe.style.height = '500px';
                break;
        }
    }

    // Show save project modal
    showSaveModal() {
        const modal = document.getElementById('saveModal');
        const projectName = document.getElementById('projectName');
        
        // Set default project name
        projectName.value = `Project-${new Date().getTime()}`;
        document.getElementById('projectDescription').value = '';
        
        modal.style.display = 'block';
        
        // Focus on project name
        setTimeout(() => projectName.focus(), 100);
    }

    // Save project to localStorage
    saveProject() {
        const name = document.getElementById('projectName').value.trim();
        const description = document.getElementById('projectDescription').value.trim();

        if (!name) {
            this.showToast('Please enter a project name', 'error');
            return;
        }

        const project = {
            id: Date.now().toString(),
            name: name,
            description: description,
            html: document.getElementById('htmlCode').value,
            css: document.getElementById('cssCode').value,
            js: document.getElementById('jsCode').value,
            timestamp: new Date().toISOString(),
            size: this.calculateProjectSize()
        };

        // Check if project name already exists
        const existingIndex = this.savedProjects.findIndex(p => p.name === name);
        if (existingIndex !== -1) {
            this.savedProjects[existingIndex] = project;
        } else {
            this.savedProjects.unshift(project);
        }

        // Save to localStorage
        localStorage.setItem('webAppMakerProjects', JSON.stringify(this.savedProjects));
        
        this.closeModal('saveModal');
        this.renderProjects();
        this.showToast(`Project "${name}" saved successfully!`, 'success');
    }

    // Load a saved project
    loadProject(projectId) {
        const project = this.savedProjects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('htmlCode').value = project.html;
            document.getElementById('cssCode').value = project.css;
            document.getElementById('jsCode').value = project.js;
            
            this.currentProject = project;
            this.showTab('editor');
            this.updateLineCounts();
            this.showToast(`Project "${project.name}" loaded!`, 'success');
        }
    }

    // Delete a project
    deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            this.savedProjects = this.savedProjects.filter(p => p.id !== projectId);
            localStorage.setItem('webAppMakerProjects', JSON.stringify(this.savedProjects));
            this.renderProjects();
            this.showToast('Project deleted successfully!', 'success');
        }
    }

    // Render saved projects list
    renderProjects() {
        const projectsGrid = document.getElementById('projectsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.savedProjects.length === 0) {
            projectsGrid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        projectsGrid.innerHTML = this.savedProjects.map(project => `
            <div class="project-card">
                <div class="project-header">
                    <h3 class="project-name">${this.escapeHtml(project.name)}</h3>
                    <div class="project-actions">
                        <button class="project-btn load-btn" onclick="app.loadProject('${project.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="project-btn delete-btn" onclick="app.deleteProject('${project.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="project-preview">
                    <div class="preview-thumbnail">
                        <small>${project.description || 'No description'}</small>
                    </div>
                </div>
                <div class="project-info">
                    <span class="project-date">${new Date(project.timestamp).toLocaleDateString()}</span>
                    <span class="project-size">${project.size}</span>
                </div>
            </div>
        `).join('');
    }

    // Reset editors to default template
    resetEditors() {
        if (confirm('Are you sure you want to reset all editors? This will erase your current work.')) {
            this.loadDefaultTemplate();
            this.showToast('Editors reset to default template', 'info');
        }
    }

    // Create new project
    newProject() {
        if (confirm('Start a new project? Your current work will be lost unless saved.')) {
            this.currentProject = null;
            this.loadDefaultTemplate();
            this.showTab('editor');
            this.showToast('New project started!', 'success');
        }
    }

    // Load default template
    loadDefaultTemplate() {
        document.getElementById('htmlCode').value = `<!DOCTYPE html>
<html>
<head>
    <title>My Awesome App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div class="container">
        <h1>Welcome to My App! 🚀</h1>
        <p>This is your mobile app created with Web App Maker.</p>
        <button onclick="showWelcome()">Click Me!</button>
        <div id="output" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;"></div>
    </div>
</body>
</html>`;

        document.getElementById('cssCode').value = `body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    min-height: 100vh;
    color: white;
}

.container {
    max-width: 400px;
    margin: 0 auto;
    text-align: center;
}

h1 {
    font-size: 24px;
    margin-bottom: 15px;
}

p {
    font-size: 16px;
    margin-bottom: 25px;
    opacity: 0.9;
}

button {
    background: #00b894;
    color: white;
    border: none;
    padding: 12px 30px;
    font-size: 16px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    background: #00a085;
    transform: translateY(-2px);
}`;

        document.getElementById('jsCode').value = `function showWelcome() {
    const output = document.getElementById('output');
    const messages = [
        'Hello! 👋',
        'Your app is working! 🎉',
        'Built with Web App Maker 📱',
        'Ready for the next step! 🚀'
    ];
    
    let index = 0;
    
    if (output.innerHTML) {
        output.innerHTML = '';
        return;
    }
    
    const interval = setInterval(() => {
        if (index < messages.length) {
            output.innerHTML += '<p>' + messages[index] + '</p>';
            index++;
        } else {
            clearInterval(interval);
        }
    }, 800);
}

// Mobile touch event support
document.addEventListener('touchstart', function() {
    // Add mobile-specific interactions here
});

console.log('App loaded successfully!');`;

        this.updateLineCounts();
    }

    // Toggle dark mode
    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        document.body.classList.toggle('dark-mode');
        
        const icon = document.querySelector('#themeToggle i');
        const text = document.querySelector('#themeToggle');
        
        if (this.isDarkMode) {
            icon.className = 'fas fa-sun';
            text.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        }
        
        localStorage.setItem('darkMode', this.isDarkMode);
    }

    // Format code (basic formatting)
    formatCode() {
        this.showToast('Code formatting coming soon!', 'info');
    }

    // Setup modal event listeners
    setupModalEvents() {
        const modal = document.getElementById('saveModal');
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-btn.secondary');
        const saveBtn = modal.querySelector('.modal-btn.primary');

        closeBtn.addEventListener('click', () => this.closeModal('saveModal'));
        cancelBtn.addEventListener('click', () => this.closeModal('saveModal'));
        saveBtn.addEventListener('click', () => this.saveProject());

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal('saveModal');
            }
        });
    }

    // Setup real-time code updates
    setupRealTimeUpdates() {
        const editors = ['htmlCode', 'cssCode', 'jsCode'];
        
        editors.forEach(editorId => {
            const editor = document.getElementById(editorId);
            editor.addEventListener('input', () => {
                this.updateLineCounts();
            });
        });
    }

    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S or Cmd+S to save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.showSaveModal();
            }
            
            // Ctrl+Enter to run preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runPreview();
            }
        });
    }

    // Update line counts for editors
    updateLineCounts() {
        const editors = [
            { id: 'htmlCode', counter: 'htmlLines' },
            { id: 'cssCode', counter: 'cssLines' },
            { id: 'jsCode', counter: 'jsLines' }
        ];

        editors.forEach(editor => {
            const code = document.getElementById(editor.id).value;
            const lines = code.split('\n').length;
            document.getElementById(editor.counter).textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
        });
    }

    // Show/hide loading overlay
    showLoading(show) {
        document.getElementById('loadingOverlay').style.display = show ? 'block' : 'none';
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Close modal
    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // Calculate project size
    calculateProjectSize() {
        const htmlSize = new Blob([document.getElementById('htmlCode').value]).size;
        const cssSize = new Blob([document.getElementById('cssCode').value]).size;
        const jsSize = new Blob([document.getElementById('jsCode').value]).size;
        const totalSize = htmlSize + cssSize + jsSize;
        
        return totalSize < 1024 ? `${totalSize} B` : `${(totalSize / 1024).toFixed(1)} KB`;
    }

    // Download file utility
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Escape HTML for safe rendering
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// Dark mode styles (added dynamically)
const darkModeStyles = `
    .dark-mode {
        background: linear-gradient(135deg, #1e3a8a, #3730a3);
    }
    
    .dark-mode .container,
    .dark-mode .preview-section,
    .dark-mode .projects-section {
        background: #1f2937;
        color: #f9fafb;
    }
    
    .dark-mode textarea {
        background: #374151;
        color: #f9fafb;
        border-color: #4b5563;
    }
`;

// Add dark mode styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = darkModeStyles;
document.head.appendChild(styleSheet);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new WebAppMaker();
});

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // navigator.serviceWorker.register('/sw.js');
    });
}
