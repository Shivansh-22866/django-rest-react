import { useState, useEffect } from 'react';
import axios from '../api/api';
import { useAuth } from '@/context/AuthContext';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { isAxiosError } from 'axios';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface SubscriptionPlan {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  features: string[];
}

interface UserSubscription {
  id: number;
  plan: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface SubscriptionStatus {
  subscription_active: boolean;
  subscription_expiry: string | null;
  free_uses_left: number;
  current_subscription: UserSubscription | null;
}

const SubscriptionPage = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansResponse, statusResponse] = await Promise.all([
          axios.get('/subscription/plans/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          }),
          axios.get('/subscription/status/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            }
          })
        ]);

        setPlans(plansResponse.data);
        setStatus(statusResponse.data);

        console.log("Status:", statusResponse.data);
        console.log("Plans:", plansResponse.data);
      } catch (err) {
        setError('Failed to load subscription data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  const handleSubscribeClick = (planId: number) => {
    if (status?.subscription_active) {
      setSelectedPlanId(planId);
      setShowConfirmation(true);
    } else {
      handleSubscribe(planId);
    }
  };

  const handleConfirmSubscription = async () => {
    if (selectedPlanId) {
      await handleSubscribe(selectedPlanId);
      setShowConfirmation(false);
      setSelectedPlanId(null);
    }
  };


  const handleSubscribe = async (planId: number) => {
    try {
      setLoading(true);
      const response = await axios.post('/subscription/subscribe/', { plan: planId }, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      // Refresh subscription status after successful subscription
      
      const statusResponse = await axios.get('/subscription/status/');
      setStatus(statusResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process subscription');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <>
    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
    <AlertDialogContent className='bg-white z-50'>
      <AlertDialogHeader>
        <AlertDialogTitle>Change Subscription Plan?</AlertDialogTitle>
        <AlertDialogDescription>
          You already have an active subscription. Subscribing to a new plan will:
          <ul className="list-disc pl-6 mt-2">
            <li>Immediately cancel your current subscription</li>
            <li>Charge you for the new plan</li>
            <li>Activate the new plan immediately</li>
          </ul>
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirmSubscription} className='bg-blue-600 text-white'>
          Confirm Change
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Plans</h1>

        {/* Current Subscription Status */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Subscription Status</h2>
          {status?.current_subscription ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">
                  {plans.find(p => p.id === status.current_subscription!.plan)?.name || 'Active Plan'}
                </p>
                <p className="text-sm text-gray-500">
                  {status.subscription_active ? (
                    `Valid until ${new Date(status.current_subscription.end_date).toLocaleDateString()}`
                  ) : 'Expired'}
                </p>
              </div>
              {!status.subscription_active && (
                <button
                  onClick={() => handleSubscribe(status?.current_subscription!.plan)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Renew Plan
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">Free Plan</p>
                <p className="text-sm text-gray-500">
                  {status?.free_uses_left} free searches remaining
                </p>
              </div>
              {status?.free_uses_left === 0 && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => window.location.hash = '#plans'}
                >
                  Upgrade Now
                </button>
              )}
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="plans">
          {plans.map((plan) => {
            const isCurrentPlan = status?.current_subscription?.plan === plan.id;
            const isActive = status?.subscription_active;

            return (
              <div
                key={plan.id}
                className={`bg-white p-6 rounded-lg shadow-md ${
                  isCurrentPlan ? 'border-2 border-blue-500' : ''
                }`}
              >
                <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
                <p className="text-3xl font-bold text-gray-900 mb-4">
                  ₹{plan.price}
                  <span className="text-sm text-gray-500 ml-2">
                    /{plan.duration_days} days
                  </span>
                </p>

                <ul className="space-y-2 mb-6">
                  {/* {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))} */}
                  <li>{plan.features}</li>
                </ul>

                <Button
        onClick={() => handleSubscribeClick(plan.id)}
        disabled={isCurrentPlan && isActive}
        className={`w-full px-4 py-2 rounded-md ${
          isCurrentPlan && isActive
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isCurrentPlan 
          ? (isActive ? 'Current Plan' : 'Reactivate')
          : 'Subscribe'}
      </Button>
              </div>
            );
          })}
        </div>

        {/* Subscription Terms */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All subscriptions auto-renew unless canceled 24 hours before renewal date</p>
          <p>Cancel anytime from your account settings</p>
        </div>
      </div>
    </div>
    </>
  );
};

export default SubscriptionPage;