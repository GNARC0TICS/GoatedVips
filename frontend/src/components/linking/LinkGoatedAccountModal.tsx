import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Link, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink,
  Mail,
  Receipt,
  MessageSquare,
  Camera,
  HelpCircle
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LinkGoatedAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  claimedGoatedId: string;
  claimedGoatedUsername: string;
  verificationMethod: 'email' | 'transaction' | 'support_ticket' | 'screenshot' | 'other';
  verificationData: string;
  userMessage: string;
  agreeToTerms: boolean;
}

interface VerificationMethodOption {
  value: FormData['verificationMethod'];
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  placeholder: string;
  example: string;
}

const verificationMethods: VerificationMethodOption[] = [
  {
    value: 'email',
    label: 'Email Verification',
    icon: Mail,
    description: 'Provide the email address associated with your Goated account',
    placeholder: 'Enter your Goated account email',
    example: 'example@email.com',
  },
  {
    value: 'transaction',
    label: 'Transaction ID',
    icon: Receipt,
    description: 'Provide a recent transaction ID from your Goated account',
    placeholder: 'Enter transaction ID',
    example: 'TX123456789',
  },
  {
    value: 'support_ticket',
    label: 'Support Ticket',
    icon: MessageSquare,
    description: 'Reference a support ticket you submitted to Goated',
    placeholder: 'Enter ticket number or reference',
    example: 'Ticket #12345 or Discord conversation',
  },
  {
    value: 'screenshot',
    label: 'Screenshot Proof',
    icon: Camera,
    description: 'Describe proof you can provide (profile screenshot, etc.)',
    placeholder: 'Describe the proof you can provide',
    example: 'Screenshot of account dashboard showing username and stats',
  },
  {
    value: 'other',
    label: 'Other Method',
    icon: HelpCircle,
    description: 'Describe another way to verify account ownership',
    placeholder: 'Describe your verification method',
    example: 'Social media linked to account, unique bet pattern, etc.',
  },
];

export function LinkGoatedAccountModal({ isOpen, onClose, onSuccess }: LinkGoatedAccountModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    claimedGoatedId: '',
    claimedGoatedUsername: '',
    verificationMethod: 'email',
    verificationData: '',
    userMessage: '',
    agreeToTerms: false,
  });

  const selectedMethod = verificationMethods.find(m => m.value === formData.verificationMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the linking terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare verification data as JSON
      const verificationData = JSON.stringify({
        data: formData.verificationData,
        method: formData.verificationMethod,
      });

      const response = await fetch('/api/linking/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          claimedGoatedId: formData.claimedGoatedId,
          claimedGoatedUsername: formData.claimedGoatedUsername,
          verificationMethod: formData.verificationMethod,
          verificationData,
          userMessage: formData.userMessage,
          agreeToTerms: formData.agreeToTerms,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Request Submitted!",
          description: "Your linking request has been submitted for admin review. You'll be notified once it's processed.",
        });
        onSuccess?.();
        onClose();
        
        // Reset form
        setFormData({
          claimedGoatedId: '',
          claimedGoatedUsername: '',
          verificationMethod: 'email',
          verificationData: '',
          userMessage: '',
          agreeToTerms: false,
        });
      } else {
        throw new Error(result.error || 'Failed to submit linking request');
      }
    } catch (error) {
      console.error('Linking request error:', error);
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : 'Failed to submit linking request. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1A1B21] border-[#2A2B31]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Link className="h-6 w-6 text-[#D7FF00]" />
            Link Your Goated Account
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Connect your platform account to your existing Goated.com account to view your wager progress and participate in races.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Important Notice */}
          <Card className="p-4 bg-blue-500/10 border-blue-500/30">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-semibold text-blue-400 mb-1">Important Information</h4>
                <ul className="text-gray-300 space-y-1 text-xs">
                  <li>• Your request will be reviewed by our admin team</li>
                  <li>• Provide accurate information to avoid delays</li>
                  <li>• Only link accounts that you actually own</li>
                  <li>• False claims may result in account suspension</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Goated Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Goated Account</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="goatedId" className="block text-sm font-medium mb-2">
                  Goated User ID
                </label>
                <Input
                  id="goatedId"
                  type="text"
                  placeholder="e.g., abc123xyz"
                  value={formData.claimedGoatedId}
                  onChange={(e) => setFormData(prev => ({ ...prev, claimedGoatedId: e.target.value }))}
                  className="bg-[#14151A] border-[#2A2B31]"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="goatedUsername" className="block text-sm font-medium mb-2">
                  Goated Username
                </label>
                <Input
                  id="goatedUsername"
                  type="text"
                  placeholder="Your exact username on Goated"
                  value={formData.claimedGoatedUsername}
                  onChange={(e) => setFormData(prev => ({ ...prev, claimedGoatedUsername: e.target.value }))}
                  className="bg-[#14151A] border-[#2A2B31]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Verification Method */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Verification</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                How can we verify you own this account?
              </label>
              <Select 
                value={formData.verificationMethod} 
                onValueChange={(value: FormData['verificationMethod']) => 
                  setFormData(prev => ({ ...prev, verificationMethod: value, verificationData: '' }))
                }
              >
                <SelectTrigger className="bg-[#14151A] border-[#2A2B31]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1B21] border-[#2A2B31]">
                  {verificationMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <SelectItem key={method.value} value={method.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {method.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedMethod && (
              <Card className="p-4 bg-[#14151A] border-[#2A2B31]">
                <div className="flex items-start gap-3 mb-3">
                  <selectedMethod.icon className="h-5 w-5 text-[#D7FF00] mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{selectedMethod.label}</h4>
                    <p className="text-sm text-gray-400">{selectedMethod.description}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Verification Details
                  </label>
                  <Input
                    type="text"
                    placeholder={selectedMethod.placeholder}
                    value={formData.verificationData}
                    onChange={(e) => setFormData(prev => ({ ...prev, verificationData: e.target.value }))}
                    className="bg-[#1A1B21] border-[#2A2B31]"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: {selectedMethod.example}
                  </p>
                </div>
              </Card>
            )}
          </div>

          {/* Additional Message */}
          <div>
            <label htmlFor="userMessage" className="block text-sm font-medium mb-2">
              Additional Information (Optional)
            </label>
            <Textarea
              id="userMessage"
              placeholder="Provide any additional context that might help verify your account ownership..."
              value={formData.userMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, userMessage: e.target.value }))}
              className="bg-[#14151A] border-[#2A2B31] min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.userMessage.length}/1000 characters
            </p>
          </div>

          {/* Terms Agreement */}
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
            <div className="flex items-start gap-3">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, agreeToTerms: !!checked }))
                }
              />
              <div className="text-sm">
                <label htmlFor="agreeToTerms" className="cursor-pointer">
                  <span className="text-yellow-400 font-medium">I confirm that:</span>
                  <ul className="text-gray-300 mt-1 space-y-1 text-xs">
                    <li>• I own the Goated account I'm claiming</li>
                    <li>• The information provided is accurate and truthful</li>
                    <li>• I understand false claims may result in account suspension</li>
                    <li>• I agree to the linking terms and conditions</li>
                  </ul>
                </label>
              </div>
            </div>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#2A2B31]">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting || !formData.agreeToTerms}
              className="bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90"
            >
              {isSubmitting ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 border-2 border-black border-t-transparent rounded-full"
                />
              ) : (
                'Submit Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}