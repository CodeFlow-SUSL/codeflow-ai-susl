import * as React from 'react';
import { useState, useEffect } from 'react';
import { User, PaymentMethod, SubscriptionPlan } from '../../backendServices/types';
import { AuthService } from '../../backendServices/authService';
import { ApiService } from '../../backendServices/apiService';

interface AccountSettingsComponentProps {
  authService: AuthService;
  apiService: ApiService;
  onLogout: () => void;
}

export const AccountSettingsComponent: React.FC<AccountSettingsComponentProps> = ({
  authService,
  apiService,
  onLogout
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
    } catch (error) {
      console.error('Error loading subscription plans:', error);
    } finally {
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
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
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
    } catch (error) {
      console.error('Error upgrading to Pro:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const h = React.createElement;

  return h(
    'div',
    { className: 'account-settings' },
    h('h2', null, 'Account Settings'),
    user
      ? h(
          'div',
          { className: 'user-info' },
          h(
            'div',
            { className: 'user-avatar' },
            user.photoURL
              ? h('img', { src: user.photoURL, alt: user.displayName || user.email })
              : h(
                  'div',
                  { className: 'avatar-placeholder' },
                  (user.displayName || user.email).charAt(0).toUpperCase()
                )
          ),
          h(
            'div',
            { className: 'user-details' },
            h('h3', null, user.displayName || 'User'),
            h('p', null, user.email),
            h('div', { className: `user-plan ${user.plan}` }, user.plan === 'pro' ? 'Pro Plan' : 'Free Plan')
          )
        )
      : null,
    h(
      'div',
      { className: 'settings-section' },
      h('h3', null, 'Subscription'),
      user?.plan === 'free'
        ? h(
            'div',
            { className: 'upgrade-section' },
            h('p', null, 'Upgrade to Pro to unlock advanced features:'),
            h(
              'ul',
              null,
              h('li', null, 'Advanced analytics and insights'),
              h('li', null, 'Team collaboration features'),
              h('li', null, 'Unlimited activity history'),
              h('li', null, 'Priority support')
            ),
            h(
              'button',
              {
                onClick: handleUpgradeToPro,
                disabled: isLoading,
                className: 'upgrade-button',
              },
              isLoading ? 'Processing...' : 'Upgrade to Pro'
            )
          )
        : h(
            'div',
            { className: 'pro-status' },
            h('p', null, 'You are currently on the Pro plan. Thank you for your support!')
          )
    ),
    h(
      'div',
      { className: 'settings-section' },
      h('h3', null, 'Payment Methods'),
      paymentMethods.length > 0
        ? h(
            'div',
            { className: 'payment-methods' },
            ...paymentMethods.map((method) =>
              h(
                'div',
                { key: method.id, className: 'payment-method' },
                h('span', null, `${method.brand} •••• ${method.last4}`),
                h('span', null, `Expires ${method.expiryMonth}/${method.expiryYear}`)
              )
            )
          )
        : h('p', null, 'No payment methods added')
    ),
    h(
      'div',
      { className: 'settings-section' },
      h('h3', null, 'Danger Zone'),
      h(
        'button',
        { onClick: handleLogout, className: 'logout-button' },
        'Logout'
      )
    )
  );
};