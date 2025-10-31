const tf = require('@tensorflow/tfjs-node');
const path = require('path');
const DataProcessor = require('./data');
const { ensureDir } = require('./utils');

class ProductivityModel {
    constructor() {
        this.model = null;
        this.dataProcessor = new DataProcessor();
        this.modelPath = path.join(__dirname, '..', 'models', 'productivity');
    }

    // Create the model architecture
    createModel() {
        const model = tf.sequential();
        
        // Input layer
        model.add(tf.layers.dense({
            inputShape: [11],
            units: 64,
            activation: 'relu',
            name: 'dense1'
        }));
        
        // Hidden layers
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 32, activation: 'relu', name: 'dense2' }));
        model.add(tf.layers.dropout({ rate: 0.2 }));
        model.add(tf.layers.dense({ units: 16, activation: 'relu', name: 'dense3' }));
        
        // Output layer
        model.add(tf.layers.dense({ units: 1, activation: 'linear', name: 'output' }));
        
        // Compile the model
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'meanSquaredError',
            metrics: ['mae']
        });
        
        return model;
    }

    // Train the model
    async train(numSamples = 1000, epochs = 50, batchSize = 32) {
        console.log('Starting model training...');
        
        // Create or get the model
        this.model = this.createModel();
        
        // Get training data
        const rawData = await this.dataProcessor.getTrainingData(numSamples);
        const { features, labels } = this.dataProcessor.processData(rawData);
        
        // Split data into training and validation sets
        const splitIndex = Math.floor(features.shape[0] * 0.8);
        const trainFeatures = features.slice([0, 0], [splitIndex, -1]);
        const trainLabels = labels.slice([0, 0], [splitIndex, -1]);
        const valFeatures = features.slice([splitIndex, 0], [-1, -1]);
        const valLabels = labels.slice([splitIndex, 0], [-1, -1]);
        
        // Train the model
        await this.model.fit(trainFeatures, trainLabels, {
            epochs,
            batchSize,
            validationData: [valFeatures, valLabels],
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}/${epochs}, loss: ${logs.loss.toFixed(4)}, val_loss: ${logs.val_loss.toFixed(4)}`);
                }
            }
        });
        
        console.log('Model training completed!');
        
        // Save the model
        await this.saveModel();
        
        // Evaluate the model
        const evaluation = this.model.evaluate(valFeatures, valLabels);
        console.log(`Validation loss: ${evaluation[0].dataSync()[0].toFixed(4)}`);
        console.log(`Validation MAE: ${evaluation[1].dataSync()[0].toFixed(4)}`);
        
        return this.model;
    }

    // Save the model
    async saveModel() {
        ensureDir(this.modelPath);
        await this.model.save(this.modelPath);
        console.log(`Model saved to ${this.modelPath}`);
    }

    // Load the model
    async loadModel() {
        if (!this.model) {
            this.model = await tf.loadLayersModel(this.modelPath);
            console.log(`Model loaded from ${this.modelPath}`);
        }
        return this.model;
    }

    // Make a prediction
    async predict(input) {
        if (!this.model) {
            await this.loadModel();
        }
        
        const processedInput = this.dataProcessor.processInput(input);
        const prediction = this.model.predict(processedInput);
        
        // Denormalize the output (0-100 scale)
        const score = prediction.dataSync()[0] * 100;
        
        // Clean up tensors
        processedInput.dispose();
        prediction.dispose();
        
        return Math.min(100, Math.max(0, score)); // Clamp between 0-100
    }

    // Get feature importance (simplified version)
    async getFeatureImportance() {
        if (!this.model) {
            await this.loadModel();
        }

        // This is a simplified approach - in a real scenario, you might use
        // permutation importance or SHAP values
        const weights = this.model.getWeights();
        const firstLayerWeights = weights[0].arraySync();
        
        // Calculate importance based on absolute weights
        const importance = firstLayerWeights.reduce((acc, row) => {
            row.forEach((val, i) => {
                acc[i] = (acc[i] || 0) + Math.abs(val);
            });
            return acc;
        }, []);
        
        // Normalize importance
        const maxImportance = Math.max(...importance);
        const normalizedImportance = importance.map(val => val / maxImportance);
        
        // Create feature importance object
        const featureNames = [
            'hour', 'dayOfWeek', 'dayOfMonth', 'keystrokes', 'commands', 
            'files', 'languages', 'duration', 'keystrokesPerMinute', 
            'commandsPerMinute', 'filesPerMinute'
        ];
        
        const featureImportance = {};
        featureNames.forEach((name, i) => {
            featureImportance[name] = normalizedImportance[i];
        });
        
        return featureImportance;
    }
}

// Main function to run training
async function main() {
    const model = new ProductivityModel();
    await model.train();
    
    // Test prediction
    const testInput = {
        hour: 14,
        dayOfWeek: 2,
        dayOfMonth: 15,
        keystrokes: 2500,
        commands: 25,
        files: 5,
        languages: 2,
        duration: 120,
        keystrokesPerMinute: 20.83,
        commandsPerMinute: 0.21,
        filesPerMinute: 0.04
    };
    
    const prediction = await model.predict(testInput);
    console.log(`Test prediction: ${prediction.toFixed(2)}`);
    
    // Get feature importance
    const importance = await model.getFeatureImportance();
    console.log('Feature importance:', importance);
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProductivityModel;