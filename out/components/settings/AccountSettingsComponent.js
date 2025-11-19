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
exports.AccountSettingsComponent = void 0;
const React = __importStar(require("react"));
const react_1 = require("react");
const AccountSettingsComponent = ({ authService, apiService, onLogout }) => {
    const [user, setUser] = (0, react_1.useState)(null);
    const [subscriptionPlans, setSubscriptionPlans] = (0, react_1.useState)([]);
    const [paymentMethods, setPaymentMethods] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setUser(authService.getCurrentUser());
        loadSubscriptionPlans();
        loadPaymentMethods();
    }, [authService]);
    const loadSubscriptionPlans = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getSubscriptionPlans();
            if (response.success && response.data) {
                setSubscriptionPlans(response.data);
            }
        }
        catch (error) {
            console.error('Error loading subscription plans:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const loadPaymentMethods = async () => {
        setIsLoading(true);
        try {
            const response = await apiService.getPaymentMethods();
            if (response.success && response.data) {
                setPaymentMethods(response.data);
            }
        }
        catch (error) {
            console.error('Error loading payment methods:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleUpgradeToPro = async () => {
        setIsLoading(true);
        try {
            const success = await authService.upgradeToPro();
            if (success) {
                setUser(authService.getCurrentUser());
            }
        }
        catch (error) {
            console.error('Error upgrading to Pro:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleLogout = async () => {
        await authService.logout();
        onLogout();
    };
    const h = React.createElement;
    return h('div', { className: 'account-settings' }, h('h2', null, 'Account Settings'), user
        ? h('div', { className: 'user-info' }, h('div', { className: 'user-avatar' }, user.photoURL
            ? h('img', { src: user.photoURL, alt: user.displayName || user.email })
            : h('div', { className: 'avatar-placeholder' }, (user.displayName || user.email).charAt(0).toUpperCase())), h('div', { className: 'user-details' }, h('h3', null, user.displayName || 'User'), h('p', null, user.email), h('div', { className: `user-plan ${user.plan}` }, user.plan === 'pro' ? 'Pro Plan' : 'Free Plan')))
        : null, h('div', { className: 'settings-section' }, h('h3', null, 'Subscription'), user?.plan === 'free'
        ? h('div', { className: 'upgrade-section' }, h('p', null, 'Upgrade to Pro to unlock advanced features:'), h('ul', null, h('li', null, 'Advanced analytics and insights'), h('li', null, 'Team collaboration features'), h('li', null, 'Unlimited activity history'), h('li', null, 'Priority support')), h('button', {
            onClick: handleUpgradeToPro,
            disabled: isLoading,
            className: 'upgrade-button',
        }, isLoading ? 'Processing...' : 'Upgrade to Pro'))
        : h('div', { className: 'pro-status' }, h('p', null, 'You are currently on the Pro plan. Thank you for your support!'))), h('div', { className: 'settings-section' }, h('h3', null, 'Payment Methods'), paymentMethods.length > 0
        ? h('div', { className: 'payment-methods' }, ...paymentMethods.map((method) => h('div', { key: method.id, className: 'payment-method' }, h('span', null, `${method.brand} •••• ${method.last4}`), h('span', null, `Expires ${method.expiryMonth}/${method.expiryYear}`))))
        : h('p', null, 'No payment methods added')), h('div', { className: 'settings-section' }, h('h3', null, 'Danger Zone'), h('button', { onClick: handleLogout, className: 'logout-button' }, 'Logout')));
};
exports.AccountSettingsComponent = AccountSettingsComponent;
//# sourceMappingURL=AccountSettingsComponent.js.map