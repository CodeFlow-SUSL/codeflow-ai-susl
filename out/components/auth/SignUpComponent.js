"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignUpComponent = void 0;
const React = __importStar(require("react"));
const react_1 = require("react");
const SignUpComponent = ({ authService, onSignUpSuccess, onLoginClick }) => {
    const [credentials, setCredentials] = (0, react_1.useState)({
        email: '',
        password: '',
        displayName: ''
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const success = await authService.signUp(credentials);
            if (success) {
                onSignUpSuccess();
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Sign up failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return React.createElement('div', { className: 'auth-container' }, React.createElement('h2', null, 'Sign up for CodeFlow'), error && React.createElement('div', { className: 'error-message' }, error), React.createElement('form', { onSubmit: handleSubmit }, React.createElement('div', { className: 'form-group' }, React.createElement('label', { htmlFor: 'displayName' }, 'Display Name (Optional)'), React.createElement('input', {
        type: 'text',
        id: 'displayName',
        name: 'displayName',
        value: credentials.displayName,
        onChange: handleInputChange
    })), React.createElement('div', { className: 'form-group' }, React.createElement('label', { htmlFor: 'email' }, 'Email'), React.createElement('input', {
        type: 'email',
        id: 'email',
        name: 'email',
        value: credentials.email,
        onChange: handleInputChange,
        required: true
    })), React.createElement('div', { className: 'form-group' }, React.createElement('label', { htmlFor: 'password' }, 'Password'), React.createElement('input', {
        type: 'password',
        id: 'password',
        name: 'password',
        value: credentials.password,
        onChange: handleInputChange,
        required: true
    })), React.createElement('button', { type: 'submit', disabled: isLoading }, isLoading ? 'Creating account...' : 'Sign Up')), React.createElement('div', { className: 'auth-links' }, React.createElement('button', { type: 'button', onClick: onLoginClick }, 'Already have an account? Login')));
};
exports.SignUpComponent = SignUpComponent;
//# sourceMappingURL=SignUpComponent.js.map