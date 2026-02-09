import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useSubscriptionStatus() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me();
        if (user && user.email) {
          setUserEmail(user.email);
          
          // Admin users bypass the paywall
          if (user.role === 'admin') {
            setIsSubscribed(true);
            setIsLoading(false);
            return;
          }
          
          const response = await base44.functions.invoke('checkSubscription', {
            email: user.email
          });
          setIsSubscribed(response.data.isActive || false);
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { isSubscribed, isLoading, userEmail };
}