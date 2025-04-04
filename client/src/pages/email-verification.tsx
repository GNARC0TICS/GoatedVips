import React, { useEffect, useState } from 'react';
import { useLocation, useRoute, Link } from 'wouter';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Email verification status types
type VerificationStatus = 'verifying' | 'success' | 'expired' | 'error';

export default function EmailVerification() {
  // Extract the token from the URL
  const [, params] = useRoute('/verify-email/:token');
  const token = params?.token || '';
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  
  // Track verification status
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email address...');
  
  useEffect(() => {
    // If no token is provided, show error
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new verification email.');
      return;
    }
    
    // Verify the email token
    async function verifyEmail() {
      try {
        const response = await fetch(`/api/email-verification/verify/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          
          // Refresh the user data to update verification status
          if (user) {
            await refreshUser();
          }
          
          toast({
            title: 'Email Verified',
            description: 'Your email address has been successfully verified.',
            variant: 'success',
          });
        } else {
          // Handle specific error cases
          if (response.status === 400 && data.message.includes('expired')) {
            setStatus('expired');
            setMessage('Your verification link has expired. Please request a new one.');
          } else {
            setStatus('error');
            setMessage(data.message || 'Failed to verify your email. Please try again.');
          }
          
          toast({
            title: 'Verification Failed',
            description: data.message || 'Failed to verify your email. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
        
        toast({
          title: 'Verification Error',
          description: 'An error occurred during verification. Please try again later.',
          variant: 'destructive',
        });
      }
    }
    
    verifyEmail();
  }, [token, toast, user, refreshUser]);
  
  // Request a new verification email
  const requestNewVerification = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    try {
      const response = await fetch('/api/email-verification/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: 'Verification Email Sent',
          description: 'A new verification email has been sent to your email address.',
          variant: 'success',
        });
      } else {
        toast({
          title: 'Request Failed',
          description: data.message || 'Failed to send verification email. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Request Error',
        description: 'An error occurred while requesting a new verification email.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="container max-w-md mx-auto my-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 rounded-xl overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-xl text-center">Email Verification</CardTitle>
            <CardDescription className="text-center">
              {status === 'verifying' ? 'Verifying your email address...' : ''}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4 text-center">
            {status === 'verifying' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-muted-foreground">Please wait while we verify your email...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                  status === 'success' 
                    ? 'bg-green-100 dark:bg-green-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                }`}>
                  {status === 'success' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-lg font-semibold mb-2">
                  {status === 'success' ? 'Email Verified' : 'Verification Failed'}
                </p>
                <p className="text-muted-foreground text-center max-w-xs mx-auto">
                  {message}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3 pt-0 pb-6">
            {status === 'success' ? (
              <Button 
                variant="default" 
                className="w-full" 
                onClick={() => navigate('/')}
              >
                Return to Home
              </Button>
            ) : status === 'expired' || status === 'error' ? (
              <>
                {user ? (
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={requestNewVerification}
                  >
                    Request New Verification
                  </Button>
                ) : (
                  <Button 
                    variant="default" 
                    className="w-full" 
                    onClick={() => navigate('/auth')}
                  >
                    Sign In to Verify
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => navigate('/')}
                >
                  Return to Home
                </Button>
              </>
            ) : null}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}