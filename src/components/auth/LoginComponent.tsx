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

  return React.createElement(
    'div',
    { className: 'auth-container' },
    React.createElement('h2', null, 'Login to CodeFlow'),
    error && React.createElement('div', { className: 'error-message' }, error),
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { htmlFor: 'email' }, 'Email'),
        React.createElement('input', {
          type: 'email',
          id: 'email',
          name: 'email',
          value: credentials.email,
          onChange: handleInputChange,
          required: true
        })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { htmlFor: 'password' }, 'Password'),
        React.createElement('input', {
          type: 'password',
          id: 'password',
          name: 'password',
          value: credentials.password,
          onChange: handleInputChange,
          required: true
        })
      ),
      React.createElement(
        'button',
        { type: 'submit', disabled: isLoading },
        isLoading ? 'Logging in...' : 'Login'
      )
    ),
    React.createElement(
      'div',
      { className: 'auth-links' },
      React.createElement(
        'button',
        { type: 'button', onClick: onSignUpClick },
        "Don't have an account? Sign up"
      )
    )
  );
};