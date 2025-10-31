const fs = require('fs');
const path = require('path');

// Ensure directory exists
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Generate synthetic data for training
function generateSyntheticData(numSamples = 1000) {
    const data = [];
    
    for (let i = 0; i < numSamples; i++) {
        // Random features
        const hour = Math.floor(Math.random() * 24);
        const dayOfWeek = Math.floor(Math.random() * 7);
        const dayOfMonth = Math.floor(Math.random() * 28) + 1;
        const keystrokes = Math.floor(Math.random() * 5000) + 100;
        const commands = Math.floor(Math.random() * 50) + 1;
        const files = Math.floor(Math.random() * 10) + 1;
        const languages = Math.floor(Math.random() * 5) + 1;
        const duration = Math.random() * 180 + 5; // 5-185 minutes
        
        // Derived features
        const keystrokesPerMinute = keystrokes / duration;
        const commandsPerMinute = commands / duration;
        const filesPerMinute = files / duration;
        
        // Synthetic productivity score (target)
        // This is a simplified formula for demonstration
        const productivityScore = Math.min(100, Math.max(0, 
            30 + 
            (keystrokesPerMinute * 2) + 
            (commandsPerMinute * 3) + 
            (filesPerMinute * 1) +
            (duration * 0.1) +
            (Math.random() * 10 - 5) // Random noise
        ));
        
        data.push({
            hour,
            dayOfWeek,
            dayOfMonth,
            keystrokes,
            commands,
            files,
            languages,
            duration,
            keystrokesPerMinute,
            commandsPerMinute,
            filesPerMinute,
            productivityScore
        });
    }
    
    return data;
}

// Normalize features
function normalizeFeatures(data) {
    const features = data.map(d => [
        d.hour / 24,
        d.dayOfWeek / 7,
        d.dayOfMonth / 31,
        d.keystrokes / 5000,
        d.commands / 50,
        d.files / 10,
        d.languages / 5,
        d.duration / 180,
        d.keystrokesPerMinute / 50,
        d.commandsPerMinute / 5,
        d.filesPerMinute / 2
    ]);
    
    const labels = data.map(d => d.productivityScore / 100);
    
    return { features, labels };
}

// Save data to JSON file
function saveData(data, filePath) {
    ensureDir(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Load data from JSON file
function loadData(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    
    const rawData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(rawData);
}

module.exports = {
    ensureDir,
    generateSyntheticData,
    normalizeFeatures,
    saveData,
    loadData
};