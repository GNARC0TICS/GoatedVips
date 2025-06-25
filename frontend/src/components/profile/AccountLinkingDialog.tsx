import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [dialogStep, setDialogStep] = useState<'usernameInput' | 'privacySettings'>('usernameInput');
  const [profilePublic, setProfilePublic] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<LinkingFormValues>({
    resolver: zodResolver(linkingSchema),
    defaultValues: {
      goatedUsername: ''
    }
  });

  React.useEffect(() => {
    if (!isOpen) {
      form.reset();
      setUsernameExists(null);
      setGoatedId(null);
      setDialogStep('usernameInput');
      setProfilePublic(false);
      setShowStats(false);
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
        type: 'error', // Already correct, but included for context
      });
      setUsernameExists(false);
    } finally {
      setChecking(false);
    }
  };

  const onSubmitUsername = async (data: LinkingFormValues) => {
    if (!usernameExists) {
      toast({
        title: 'Invalid Username',
        description: 'Please enter a valid Goated username',
        type: 'error', // Already correct
      });
      return;
    }
    // Successfully verified username, move to privacy settings
    setDialogStep('privacySettings');
    toast({
      title: 'Username Verified',
      description: 'Please set your profile privacy preferences.',
      type: 'success', // Already correct
    });
  };

  const handleSavePrivacySettings = async () => {
    setSubmitting(true);
    const goatedUsername = form.getValues('goatedUsername');
    try {
      // This method in profileService will need to be updated or created
      // to handle the link request along with privacy settings.
      await profileService.requestGoatedAccountLink(goatedUsername, {
        profilePublic,
        showStats,
      });

      toast({
        title: 'Link Request & Privacy Settings Submitted',
        description: 'Your request is being reviewed by an admin.',
        type: 'success', // Already correct
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error Saving Privacy Settings',
        description: error instanceof ProfileError ? error.message : 'Failed to save privacy preferences.',
        type: 'error', // Already correct
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31]">
        {dialogStep === 'usernameInput' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">Link Your Goated Account</DialogTitle>
              <DialogDescription className="text-[#8A8B91]">
                Enter your Goated.com username to link your accounts. This will allow you to track your wager progress and VIP tier.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitUsername)} className="space-y-6">
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
                          Username verified! Click next to set privacy.
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
                        Verifying...
                      </>
                    ) : (
                      'Next: Set Privacy'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}

        {dialogStep === 'privacySettings' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">Profile Privacy Settings</DialogTitle>
              <DialogDescription className="text-[#8A8B91]">
                Choose how your Goated profile information will be displayed on this platform.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <RadioGroup
                defaultValue={profilePublic ? "public" : "private"}
                onValueChange={(value) => setProfilePublic(value === "public")}
                className="space-y-2"
              >
                <Label className="text-base font-medium text-white">Profile Visibility</Label>
                <div className="flex items-center space-x-2 p-3 bg-[#2A2B31] rounded-md">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="text-white cursor-pointer">Keep Profile Private</Label>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-[#2A2B31] rounded-md">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="text-white cursor-pointer">Make Profile Public</Label>
                </div>
              </RadioGroup>

              {profilePublic && (
                <div className="space-y-3 pl-6 border-l-2 border-[#D7FF00]/50 pt-2 pb-1">
                  <Label className="text-sm font-medium text-white">Public Profile Options:</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showStats"
                      checked={showStats}
                      onCheckedChange={(checked) => setShowStats(Boolean(checked))}
                      className="border-white data-[state=checked]:bg-[#D7FF00] data-[state=checked]:text-black"
                    />
                    <Label htmlFor="showStats" className="text-sm text-white cursor-pointer">
                      Show wager stats (total wagered, tier progress)
                    </Label>
                  </div>
                  {/* Add more checkboxes for other specific stats if needed */}
                </div>
              )}
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogStep('usernameInput')}
                className="border-[#2A2B31] text-white hover:text-white hover:bg-[#2A2B31]"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSavePrivacySettings}
                disabled={submitting}
                className="bg-[#D7FF00] text-black hover:bg-[#C0E700]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings & Submit Request'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
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
        type: 'success', // Already correct
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      onClose();
    } catch (error) {
      console.error('Error unlinking account:', error);
      toast({
        title: 'Error Unlinking Account',
        description: error instanceof ProfileError ? error.message : 'Failed to unlink account',
        type: 'error', // Already correct
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
