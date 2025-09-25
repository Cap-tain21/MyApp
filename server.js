const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.static(path.join(__dirname)));
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes for projects
app.get('/api/projects', (req, res) => {
    try {
        if (fs.existsSync('projects.json')) {
            const data = fs.readFileSync('projects.json', 'utf8');
            res.json({ projects: JSON.parse(data) });
        } else {
            res.json({ projects: [] });
        }
    } catch (error) {
        res.json({ projects: [] });
    }
});

app.post('/api/projects/save', (req, res) => {
    try {
        const project = req.body;
        let projects = [];

        if (fs.existsSync('projects.json')) {
            const data = fs.readFileSync('projects.json', 'utf8');
            projects = JSON.parse(data);
        }

        // Remove existing project with same name
        projects = projects.filter(p => p.name !== project.name);
        projects.unshift(project);

        fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save project' });
    }
});

app.get('/api/projects/:id', (req, res) => {
    try {
        if (fs.existsSync('projects.json')) {
            const data = fs.readFileSync('projects.json', 'utf8');
            const projects = JSON.parse(data);
            const project = projects.find(p => p.id === req.params.id);

            if (project) {
                res.json({ project });
            } else {
                res.status(404).json({ error: 'Project not found' });
            }
        } else {
            res.status(404).json({ error: 'No projects found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load project' });
    }
});

app.delete('/api/projects/:id', (req, res) => {
    try {
        if (fs.existsSync('projects.json')) {
            const data = fs.readFileSync('projects.json', 'utf8');
            let projects = JSON.parse(data);
            projects = projects.filter(p => p.id !== req.params.id);

            fs.writeFileSync('projects.json', JSON.stringify(projects, null, 2));
            res.json({ success: true });
        } else {
            res.status(404).json({ error: 'No projects found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});

// APK export endpoint (placeholder - you'll need to implement Cordova integration)
app.post('/api/export-apk', (req, res) => {
    const { html, css, js, projectName } = req.body;

    // This is where you would integrate with Cordova/PhoneGap
    // For now, we'll return a success message
    res.json({
        success: true,
        message: 'APK export functionality will be implemented soon',
        note: 'You need to set up Cordova/PhoneGap for actual APK generation'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Web App Maker running on http://localhost:${PORT}`);
    console.log(`📱 Access from other devices: http://[YOUR_TERMUX_IP]:${PORT}`);
});
