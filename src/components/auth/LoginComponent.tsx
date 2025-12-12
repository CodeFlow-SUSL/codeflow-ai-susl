import * as React from 'react';
import { useState } from 'react';
import { LoginCredentials } from '../../backendServices/types';
import { AuthService } from '../../backendServices/authService';

interface LoginComponentProps {
  authService: AuthService;
  onLoginSuccess: () => void;
  onSignUpClick: () => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({
  authService,
  onLoginSuccess,
  onSignUpClick
}) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const success = await authService.login(credentials);
      if (success) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login to CodeFlow</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="auth-links">
        <button type="button" onClick={onSignUpClick}>
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};