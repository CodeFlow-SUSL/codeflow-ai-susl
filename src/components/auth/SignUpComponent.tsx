import * as React from 'react';
import { useState } from 'react';

// Types defined locally since backend services don't exist yet
interface SignUpCredentials {
    email: string;
    password: string;
    confirmPassword: string;
}

// Mock auth service interface
interface AuthService {
    signUp(credentials: SignUpCredentials): Promise<void>;
}

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
    setCredentials((prev: SignUpCredentials) => ({ ...prev, [name]: value }));
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

  return React.createElement(
    'div',
    { className: 'auth-container' },
    React.createElement('h2', null, 'Sign up for CodeFlow'),
    error && React.createElement('div', { className: 'error-message' }, error),
    React.createElement(
      'form',
      { onSubmit: handleSubmit },
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { htmlFor: 'displayName' }, 'Display Name (Optional)'),
        React.createElement('input', {
          type: 'text',
          id: 'displayName',
          name: 'displayName',
          value: credentials.displayName,
          onChange: handleInputChange
        })
      ),
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
        isLoading ? 'Creating account...' : 'Sign Up'
      )
    ),
    React.createElement(
      'div',
      { className: 'auth-links' },
      React.createElement(
        'button',
        { type: 'button', onClick: onLoginClick },
        'Already have an account? Login'
      )
    )
  );
};