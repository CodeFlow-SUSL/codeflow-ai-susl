import * as vscode from 'vscode';
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { ProductivityInsight } from './aiAnalyzer';
import { UserProgress } from './gamification';

export class BackendServices {
    private context: vscode.ExtensionContext;
    private apiEndpoint: string = 'https://api.codeflow.example'; // Replace with your actual API
    private isEnabled: boolean = false;
    private localServer: http.Server | undefined;
    private serverPort: number = 3000;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        // Check if cloud sync is enabled
        const config = vscode.workspace.getConfiguration('codeflow');
        this.isEnabled = config.get('cloudSync', false);
    }

    public async syncData(insight: ProductivityInsight, progress: UserProgress): Promise<boolean> {
        if (!this.isEnabled) {
            return false;
        }
        try {
            // Get user identifier (you would implement proper authentication in a real extension)
            const userId = await this.getUserId();
            // Prepare data for sync
            const syncData = {
                userId,
                timestamp: Date.now(),
                insight,
                progress
            };
            // Send data to backend
            const response = await fetch(`${this.apiEndpoint}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(syncData)
            });
            if (response.ok) {
                console.log('Data synced successfully');
                return true;
            } else {
                console.error('Failed to sync data:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('Error syncing data:', error);
            return false;
        }
    }

    public async getTeamInsights(teamId: string): Promise<any> {
        if (!this.isEnabled) {
            throw new Error('Cloud sync is disabled');
        }
        try {
            const response = await fetch(`${this.apiEndpoint}/teams/${teamId}/insights`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                }
            });
            if (response.ok) {
                return await response.json();
            } else {
                throw new Error(`Failed to get team insights: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error getting team insights:', error);
            throw error;
        }
    }

    private async getUserId(): Promise<string> {
        // In a real implementation, you would get this from authentication
        // For now, we'll use a machine ID
        const storage = this.context.globalState;
        let userId = storage.get<string>('codeflow-userId');
        if (!userId) {
            // Generate a random ID
            userId = 'user-' + Math.random().toString(36).substr(2, 9);
            await storage.update('codeflow-userId', userId);
        }
        return userId;
    }

    private async getAuthToken(): Promise<string> {
        // In a real implementation, you would implement OAuth or similar
        // For now, we'll return a placeholder
        const storage = this.context.globalState;
        let token = storage.get<string>('codeflow-authToken');
        if (!token) {
            // In a real extension, you would implement proper authentication flow
            // For this example, we'll just show a message and use a placeholder
            vscode.window.showInformationMessage('Cloud sync requires authentication. This is a placeholder.');
            token = 'placeholder-token';
            await storage.update('codeflow-authToken', token);
        }
        return token;
    }

    public async authenticate(): Promise<boolean> {
        // In a real implementation, you would implement OAuth flow
        // For this example, we'll just show a message
        await vscode.window.showInformationMessage(
            'This would open a browser for authentication in a real implementation',
            { modal: true },
            'OK'
        );
        // Enable cloud sync
        const config = vscode.workspace.getConfiguration('codeflow');
        await config.update('cloudSync', true, vscode.ConfigurationTarget.Global);
        this.isEnabled = true;
        return true;
    }
}

export class BackendServicesModule {
    private context: vscode.ExtensionContext;
    private authService: AuthService;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.authService = new AuthService(context);
    }

    public getAuthService(): AuthService {
        return this.authService;
    }

    public stopLocalServer(): void {
        this.authService.stopLocalServer();
    }

    public dispose(): void {
        // Cleanup if needed
        this.stopLocalServer();
    }
}

class AuthService {
    private context: vscode.ExtensionContext;
    private localServer: http.Server | undefined;
    private serverPort: number = 3000;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    public async logout(): Promise<void> {
        try {
            // Clear stored auth data
            await this.context.globalState.update('codeflow-authToken', undefined);
            await this.context.globalState.update('codeflow-userId', undefined);
            
            // Disable cloud sync
            const config = vscode.workspace.getConfiguration('codeflow');
            await config.update('cloudSync', false, vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage('Successfully logged out from CodeFlow');
        } catch (error) {
            vscode.window.showErrorMessage(`Logout failed: ${error}`);
        }
    }

    public async upgradeToPro(): Promise<void> {
        try {
            // Start local server if not already running
            await this.startLocalServer();
            
            // Open pro plan page in browser
            const uri = vscode.Uri.parse(`http://localhost:${this.serverPort}/pro-plan`);
            await vscode.env.openExternal(uri);
            vscode.window.showInformationMessage('Opening CodeFlow Pro plan in your browser...');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to open browser: ${error}`);
            console.error('Upgrade error:', error);
        }
    }

    private async startLocalServer(): Promise<void> {
        // If server is already running, return
        if (this.localServer && this.localServer.listening) {
            return;
        }

        return new Promise((resolve, reject) => {
            try {
                this.localServer = http.createServer((req, res) => {
                    console.log(`Request received: ${req.url}`);

                    // Set CORS headers
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                    if (req.url === '/pro-plan' || req.url === '/') {
                        // Serve the pro plan HTML file
                        const htmlPath = path.join(this.context.extensionPath, 'media', 'pro-plan.html');
                        
                        fs.readFile(htmlPath, 'utf8', (err, data) => {
                            if (err) {
                                console.error('Error reading HTML file:', err);
                                res.writeHead(500, { 'Content-Type': 'text/plain' });
                                res.end('Error loading page');
                                return;
                            }
                            
                            res.writeHead(200, { 'Content-Type': 'text/html' });
                            res.end(data);
                        });
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('Not Found');
                    }
                });

                // Find an available port
                this.localServer.listen(this.serverPort, () => {
                    console.log(`Local server started on port ${this.serverPort}`);
                    resolve();
                });

                this.localServer.on('error', (err: NodeJS.ErrnoException) => {
                    if (err.code === 'EADDRINUSE') {
                        // Port is in use, try next port
                        this.serverPort++;
                        this.localServer = undefined;
                        this.startLocalServer().then(resolve).catch(reject);
                    } else {
                        console.error('Server error:', err);
                        reject(err);
                    }
                });
            } catch (error) {
                console.error('Error starting server:', error);
                reject(error);
            }
        });
    }

    public stopLocalServer(): void {
        if (this.localServer) {
            this.localServer.close(() => {
                console.log('Local server stopped');
            });
            this.localServer = undefined;
        }
    }
}
