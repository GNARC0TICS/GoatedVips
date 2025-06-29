import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { profileService, UserProfile, ProfileError } from '@/services/profileService';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface PrivacySettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile; // Current profile data to pre-fill settings
}

export function PrivacySettingsDialog({ isOpen, onClose, profile }: PrivacySettingsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [profilePublic, setProfilePublic] = useState(profile.profilePublic || false);
  const [showStats, setShowStats] = useState(profile.showStats || false);

  useEffect(() => {
    if (isOpen) {
      setProfilePublic(profile.profilePublic || false);
      setShowStats(profile.showStats || false);
    }
  }, [isOpen, profile]);

  const handleSaveChanges = async () => {
    setIsSubmitting(true);
    try {
      // Assuming profileService.updateProfile can handle these fields
      // or a dedicated method like updatePrivacySettings exists.
      // The backend PATCH /api/users/:id should be ableto handle these fields.
      await profileService.updateProfile(String(profile.id), {
        profilePublic,
        showStats,
      });

      toast({
        title: 'Privacy Settings Updated',
        description: 'Your profile privacy settings have been saved.',
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['profile', String(profile.id)] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] }); // If current user's profile changed
      onClose();
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: 'Error Saving Settings',
        description: error instanceof ProfileError ? error.message : 'Failed to save privacy settings.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile.goatedAccountLinked) {
    // This dialog should ideally not be opened if account is not linked.
    // But as a safeguard:
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Privacy Settings</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-[#8A8B91]">
            Privacy settings are only available for Goated linked accounts.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="border-[#2A2B31] text-white hover:text-white hover:bg-[#2A2B31]">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-[#1A1B21] text-white border-[#2A2B31]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">Profile Privacy Settings</DialogTitle>
          <DialogDescription className="text-[#8A8B91]">
            Choose how your profile information will be displayed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <RadioGroup
            value={profilePublic ? "public" : "private"}
            onValueChange={(value) => setProfilePublic(value === "public")}
            className="space-y-2"
          >
            <Label className="text-base font-medium text-white">Profile Visibility</Label>
            <div className="flex items-center space-x-2 p-3 bg-[#2A2B31] rounded-md">
              <RadioGroupItem value="private" id="privacy-private" />
              <Label htmlFor="privacy-private" className="text-white cursor-pointer">Keep Profile Private</Label>
            </div>
            <div className="text-xs text-[#8A8B91] pl-7">
              If private, your name will be censored on leaderboards and profile details hidden from others.
            </div>
            <div className="flex items-center space-x-2 p-3 bg-[#2A2B31] rounded-md">
              <RadioGroupItem value="public" id="privacy-public" />
              <Label htmlFor="privacy-public" className="text-white cursor-pointer">Make Profile Public</Label>
            </div>
          </RadioGroup>

          {profilePublic && ( // Only show "Show Stats" if profile is public
            <div className="space-y-3 pl-6 border-l-2 border-[#D7FF00]/50 pt-2 pb-1">
              <Label className="text-sm font-medium text-white">Public Profile Options:</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="privacy-showStats"
                  checked={showStats}
                  onCheckedChange={(checked) => setShowStats(Boolean(checked))}
                  className="border-white data-[state=checked]:bg-[#D7FF00] data-[state=checked]:text-black"
                />
                <Label htmlFor="privacy-showStats" className="text-sm text-white cursor-pointer">
                  Show wager stats (total wagered, tier progress)
                </Label>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
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
            onClick={handleSaveChanges}
            disabled={isSubmitting}
            className="bg-[#D7FF00] text-black hover:bg-[#C0E700]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
