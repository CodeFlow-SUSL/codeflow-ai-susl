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

  return (
    <div className="account-settings">
      <h2>Account Settings</h2>
      
      {user && (
        <div className="user-info">
          <div className="user-avatar">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || user.email} />
            ) : (
              <div className="avatar-placeholder">
                {(user.displayName || user.email).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <h3>{user.displayName || 'User'}</h3>
            <p>{user.email}</p>
            <div className={`user-plan ${user.plan}`}>
              {user.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
            </div>
          </div>
        </div>
      )}

      <div className="settings-section">
        <h3>Subscription</h3>
        {user?.plan === 'free' ? (
          <div className="upgrade-section">
            <p>Upgrade to Pro to unlock advanced features:</p>
            <ul>
              <li>Advanced analytics and insights</li>
              <li>Team collaboration features</li>
              <li>Unlimited activity history</li>
              <li>Priority support</li>
            </ul>
            <button 
              onClick={handleUpgradeToPro} 
              disabled={isLoading}
              className="upgrade-button"
            >
              {isLoading ? 'Processing...' : 'Upgrade to Pro'}
            </button>
          </div>
        ) : (
          <div className="pro-status">
            <p>You are currently on the Pro plan. Thank you for your support!</p>
          </div>
        )}
      </div>

      <div className="settings-section">
        <h3>Payment Methods</h3>
        {paymentMethods.length > 0 ? (
          <div className="payment-methods">
            {paymentMethods.map(method => (
              <div key={method.id} className="payment-method">
                <span>{method.brand} •••• {method.last4}</span>
                <span>Expires {method.expiryMonth}/{method.expiryYear}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No payment methods added</p>
        )}
      </div>

      <div className="settings-section">
        <h3>Danger Zone</h3>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};