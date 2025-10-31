const tf = require('@tensorflow/tfjs');
const path = require('path');
const { generateSyntheticData, normalizeFeatures, saveData } = require('./utils');

class DataProcessor {
    constructor() {
        this.featureNames = [
            'hour', 'dayOfWeek', 'dayOfMonth', 'keystrokes', 'commands', 
            'files', 'languages', 'duration', 'keystrokesPerMinute', 
            'commandsPerMinute', 'filesPerMinute'
        ];
    }

    // Generate or load training data
    async getTrainingData(numSamples = 1000, forceRegenerate = false) {
        const dataPath = path.join(__dirname, '..', 'data', 'training_data.json');
        
        if (!forceRegenerate) {
            const existingData = require('./utils').loadData(dataPath);
            if (existingData) {
                return existingData;
            }
        }
        
        // Generate new data
        const data = generateSyntheticData(numSamples);
        
        // Save for future use
        saveData(data, dataPath);
        
        return data;
    }

    // Convert raw data to tensors
    processData(data) {
        const { features, labels } = normalizeFeatures(data);
        
        return {
            features: tf.tensor2d(features),
            labels: tf.tensor2d(labels, [labels.length, 1])
        };
    }

    // Process a single input for prediction
    processInput(input) {
        // Normalize the input
        const normalized = [
            input.hour / 24,
            input.dayOfWeek / 7,
            input.dayOfMonth / 31,
            input.keystrokes / 5000,
            input.commands / 50,
            input.files / 10,
            input.languages / 5,
            input.duration / 180,
            input.keystrokesPerMinute / 50,
            input.commandsPerMinute / 5,
            input.filesPerMinute / 2
        ];
        
        return tf.tensor2d([normalized]);
    }
}

module.exports = DataProcessor;