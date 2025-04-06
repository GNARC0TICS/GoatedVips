import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { profileService } from '@/services/profileService';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { ProfileError } from '@/services/profileService';
import { useAuth } from '@/hooks/use-auth';
import { useQueryClient } from '@tanstack/react-query';

const linkingSchema = z.object({
  goatedUsername: z.string().min(3, 'Username must be at least 3 characters')
});

type LinkingFormValues = z.infer<typeof linkingSchema>;

interface AccountLinkingDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountLinkingDialog({ isOpen, onClose }: AccountLinkingDialogProps) {
  const { toast } = useToast();
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [goatedId, setGoatedId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LinkingFormValues>({
    resolver: zodResolver(linkingSchema),
    defaultValues: {
      goatedUsername: ''
    }
  });

  // Reset state when dialog closes or opens
  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setUsernameExists(null);
      setGoatedId(null);
    }
  }, [isOpen, form]);

  const checkUsername = async (username: string) => {
    if (!username || username.length < 3) return;
    
    setChecking(true);
    setUsernameExists(null);
    
    try {
      const result = await profileService.checkGoatedUsername(username);
      setUsernameExists(result.exists);
      if (result.exists && result.goatedId) {
        setGoatedId(result.goatedId);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      toast({
        title: 'Error checking username',
        description: error instanceof ProfileError ? error.message : 'Failed to verify username',
        variant: 'destructive',
      });
      setUsernameExists(false);
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (data: LinkingFormValues) => {
    if (!usernameExists) {
      toast({
        title: 'Invalid Username',
        description: 'Please enter a valid Goated username',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const result = await profileService.requestGoatedAccountLink(data.goatedUsername);
      
      toast({
        title: 'Request Submitted',
        description: result.message || 'Your account linking request has been submitted for review',
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: 'Error Submitting Request',
        description: error instanceof ProfileError ? error.message : 'Failed to submit link request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Link Your Goated Account</DialogTitle>
          <DialogDescription className="text-[#8A8B91]">
            Enter your Goated.com username to link your accounts. This will allow you to track your wager progress and VIP tier.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="goatedUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Goated Username</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input
                        placeholder="Enter your Goated username"
                        className="bg-[#2A2B31] border-[#3A3B41] text-white"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setUsernameExists(null);
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          checkUsername(e.target.value);
                        }}
                      />
                    </FormControl>
                    {checking && <Loader2 className="h-4 w-4 animate-spin text-[#8A8B91]" />}
                    {usernameExists === true && <Check className="h-4 w-4 text-green-500" />}
                    {usernameExists === false && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <FormMessage />
                  
                  {usernameExists === false && (
                    <p className="text-red-500 text-sm mt-1">
                      Username not found on Goated. Please check your spelling.
                    </p>
                  )}
                  
                  {usernameExists === true && (
                    <p className="text-green-500 text-sm mt-1">
                      Username verified! Click submit to request linking.
                    </p>
                  )}
                </FormItem>
              )}
            />
            
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-[#2A2B31] text-white hover:text-white hover:bg-[#2A2B31]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !usernameExists}
                className="bg-[#D7FF00] text-black hover:bg-[#C0E700]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function UnlinkAccountDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { toast } = useToast();
  const [unlinking, setUnlinking] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleUnlink = async () => {
    setUnlinking(true);
    
    try {
      const result = await profileService.unlinkGoatedAccount();
      
      toast({
        title: 'Account Unlinked',
        description: result.message || 'Your Goated account has been unlinked successfully',
        variant: 'default',
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    } catch (error) {
      console.error('Error unlinking account:', error);
      toast({
        title: 'Error Unlinking Account',
        description: error instanceof ProfileError ? error.message : 'Failed to unlink account',
        variant: 'destructive',
      });
    } finally {
      setUnlinking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Unlink Goated Account</DialogTitle>
          <DialogDescription className="text-[#8A8B91]">
            Are you sure you want to unlink your Goated account? This will remove access to your wager data and VIP tier progress.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-[#2A2B31] rounded-md">
          <div className="flex items-center space-x-2">
            <span className="font-medium">Linked Username:</span>
            <span className="text-[#D7FF00]">{user?.goatedUsername}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="font-medium">Goated ID:</span>
            <span className="font-mono text-sm text-[#8A8B91]">{user?.goatedId}</span>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-[#2A2B31] text-white hover:text-white hover:bg-[#2A2B31]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUnlink}
            disabled={unlinking}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            {unlinking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlinking...
              </>
            ) : (
              'Unlink Account'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AccountLinkStatus({ 
  onLinkClick,
  onUnlinkClick 
}: { 
  onLinkClick: () => void;
  onUnlinkClick: () => void;
}) {
  const { user } = useAuth();
  
  if (!user) return null;
  
  if (user.goatedLinkRequested) {
    return (
      <div className="p-4 bg-[#242529] rounded-md border border-[#2A2B31]">
        <h3 className="text-white font-medium flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#D7FF00]" />
          Account Link Pending
        </h3>
        <p className="text-[#8A8B91] text-sm mt-1">
          Your request to link "{user.goatedUsernameRequested}" is being reviewed by an admin.
        </p>
      </div>
    );
  }
  
  if (user.goatedAccountLinked) {
    return (
      <div className="p-4 bg-[#242529] rounded-md border border-[#2A2B31]">
        <h3 className="text-white font-medium flex items-center">
          <Check className="h-4 w-4 mr-2 text-green-500" />
          Goated Account Linked
        </h3>
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[#8A8B91]">Username:</span>
            <span className="text-[#D7FF00] font-medium">{user.goatedUsername}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[#8A8B91]">Goated ID:</span>
            <span className="text-white font-mono text-xs">{user.goatedId}</span>
          </div>
        </div>
        <Button 
          onClick={onUnlinkClick}
          variant="outline" 
          size="sm" 
          className="w-full mt-3 border-[#3A3B41] text-white"
        >
          Unlink Account
        </Button>
      </div>
    );
  }
  
  return (
    <div className="p-4 bg-[#242529] rounded-md border border-[#2A2B31]">
      <h3 className="text-white font-medium">Connect Goated Account</h3>
      <p className="text-[#8A8B91] text-sm mt-1">
        Link your Goated.com account to track your wager progress and VIP tier.
      </p>
      <Button 
        onClick={onLinkClick} 
        className="w-full mt-3 bg-[#D7FF00] text-black hover:bg-[#C0E700]"
      >
        Connect Account
      </Button>
    </div>
  );
}