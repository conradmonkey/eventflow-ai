import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscriptionStatus() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // Paywall disabled - all users have access
        setIsSubscribed(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { isSubscribed, isLoading, userEmail };
}