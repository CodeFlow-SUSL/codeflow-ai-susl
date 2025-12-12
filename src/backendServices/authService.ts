import * as vscode from 'vscode';
import { User, AuthState, LoginCredentials, SignUpCredentials } from './types';
import { ConfigManager } from './config';

// Mock Firebase Auth for demonstration
// In a real implementation, you would use the Firebase SDK
export class AuthService {
  private static instance: AuthService;
  private authState: AuthState = {
    user: null,
    isLoading: false,
    error: null
  };
  private config: ConfigManager;
  private stateChangeCallbacks: ((state: AuthState) => void)[] = [];

  private constructor(context: vscode.ExtensionContext) {
    this.config = ConfigManager.getInstance(context);
    this.loadUserFromStorage();
  }

  public static getInstance(context: vscode.ExtensionContext): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(context);
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    const context = this.config['context'];
    const userJson = context.globalState.get<string>('codeflow.user');
    
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.authState.user = user;
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
  }

  private saveUserToStorage(user: User | null): void {
    const context = this.config['context'];
    if (user) {
      context.globalState.update('codeflow.user', JSON.stringify(user));
    } else {
      context.globalState.update('codeflow.user', undefined);
    }
  }

  private updateAuthState(newState: Partial<AuthState>): void {
    this.authState = { ...this.authState, ...newState };
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    this.stateChangeCallbacks.forEach(callback => callback(this.authState));
  }

  public onAuthStateChanged(callback: (state: AuthState) => void): () => void {
    this.stateChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.stateChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.stateChangeCallbacks.splice(index, 1);
      }
    };
  }

  public getCurrentUser(): User | null {
    return this.authState.user;
  }

  public isAuthenticated(): boolean {
    return !!this.authState.user;
  }

  public isProUser(): boolean {
    return this.authState.user?.plan === 'pro';
  }

  public async login(credentials: LoginCredentials): Promise<boolean> {
    this.updateAuthState({ isLoading: true, error: null });
    
    try {
      // In a real implementation, you would use Firebase Auth SDK
      // const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (credentials.email === 'user@example.com' && credentials.password === 'password') {
        const user: User = {
          id: 'user123',
          email: credentials.email,
          displayName: 'Demo User',
          plan: 'pro',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        };
        
        this.updateAuthState({ user, isLoading: false });
        this.saveUserToStorage(user);
        
        vscode.window.showInformationMessage(`Welcome back, ${user.displayName || user.email}!`);
        return true;
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      this.updateAuthState({ isLoading: false, error: errorMessage });
      vscode.window.showErrorMessage(errorMessage);
      return false;
    }
  }

  public async signUp(credentials: SignUpCredentials): Promise<boolean> {
    this.updateAuthState({ isLoading: true, error: null });
    
    try {
      // In a real implementation, you would use Firebase Auth SDK
      // const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: 'user' + Math.floor(Math.random() * 1000),
        email: credentials.email,
        displayName: credentials.displayName || credentials.email.split('@')[0],
        plan: 'free',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      
      this.updateAuthState({ user, isLoading: false });
      this.saveUserToStorage(user);
      
      vscode.window.showInformationMessage(`Account created successfully! Welcome, ${user.displayName || user.email}!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      this.updateAuthState({ isLoading: false, error: errorMessage });
      vscode.window.showErrorMessage(errorMessage);
      return false;
    }
  }

  public async logout(): Promise<void> {
    try {
      // In a real implementation, you would use Firebase Auth SDK
      // await signOut(auth);
      
      this.updateAuthState({ user: null, isLoading: false, error: null });
      this.saveUserToStorage(null);
      
      vscode.window.showInformationMessage('You have been logged out successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      vscode.window.showErrorMessage(errorMessage);
    }
  }

  public async upgradeToPro(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      vscode.window.showErrorMessage('You must be logged in to upgrade to Pro plan');
      return false;
    }
    
    if (this.isProUser()) {
      vscode.window.showInformationMessage('You already have the Pro plan');
      return true;
    }
    
    try {
      // In a real implementation, you would integrate with a payment provider
      // For now, we'll just simulate the upgrade
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.authState.user) {
        this.authState.user.plan = 'pro';
        this.updateAuthState({ user: { ...this.authState.user } });
        this.saveUserToStorage(this.authState.user);
        
        vscode.window.showInformationMessage('Successfully upgraded to Pro plan!');
        return true;
      }
      
      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upgrade failed';
      vscode.window.showErrorMessage(errorMessage);
      return false;
    }
  }

  public getAuthState(): AuthState {
    return { ...this.authState };
  }
}