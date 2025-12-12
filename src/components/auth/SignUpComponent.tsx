import * as React from 'react';
import { useState } from 'react';
import { SignUpCredentials } from '../../backendServices/types';
import { AuthService } from '../../backendServices/authService';

interface SignUpComponentProps {
  authService: AuthService;
  onSignUpSuccess: () => void;
  onLoginClick: () => void;
}

export const SignUpComponent: React.FC<SignUpComponentProps> = ({
  authService,
  onSignUpSuccess,
  onLoginClick
}) => {
  const [credentials, setCredentials] = useState<SignUpCredentials>({
    email: '',
    password: '',
    displayName: ''
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
      const success = await authService.signUp(credentials);
      if (success) {
        onSignUpSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign up for CodeFlow</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="displayName">Display Name (Optional)</label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={credentials.displayName}
            onChange={handleInputChange}
          />
        </div>
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
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      <div className="auth-links">
        <button type="button" onClick={onLoginClick}>
          Already have an account? Login
        </button>
      </div>
    </div>
  );
};