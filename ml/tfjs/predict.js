const path = require('path');
const ProductivityModel = require('./train');

class ProductivityPredictor {
    constructor(modelPath) {
        this.model = new ProductivityModel();
        this.modelPath = modelPath || path.join(__dirname, '..', 'models', 'productivity');
    }

    // Initialize the model
    async initialize() {
        try {
            await this.model.loadModel();
            return true;
        } catch (error) {
            console.error('Error loading model:', error);
            return false;
        }
    }

    // Predict productivity score
    async predict(input) {
        if (!this.model.model) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize model');
            }
        }
        
        return await this.model.predict(input);
    }

    // Get feature importance
    async getFeatureImportance() {
        if (!this.model.model) {
            const initialized = await this.initialize();
            if (!initialized) {
                throw new Error('Failed to initialize model');
            }
        }
        
        return await this.model.getFeatureImportance();
    }
}

// Main function for command-line usage
async function main() {
    if (process.argv.length < 3) {
        console.error('Usage: node predict.js <input_json_file>');
        process.exit(1);
    }
    
    const inputPath = process.argv[2];
    const predictor = new ProductivityPredictor();
    
    try {
        // Load input data
        const fs = require('fs');
        const inputData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
        
        // Make prediction
        const score = await predictor.predict(inputData);
        
        // Get feature importance
        const importance = await predictor.getFeatureImportance();
        
        // Output result
        const result = {
            score: score,
            featureImportance: importance
        };
        
        console.log(JSON.stringify(result));
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}

module.exports = ProductivityPredictor;