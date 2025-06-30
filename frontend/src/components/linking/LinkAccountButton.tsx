import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LinkGoatedAccountModal } from './LinkGoatedAccountModal';
import { motion } from 'framer-motion';

interface LinkAccountButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

export function LinkAccountButton({ 
  className = '', 
  variant = 'default',
  size = 'md',
  showStatus = true
}: LinkAccountButtonProps) {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) {
    return null;
  }

  // Determine the linking status
  const getLinkingStatus = () => {
    if (user.goatedLinked && user.goatedId) {
      return {
        status: 'linked',
        icon: CheckCircle,
        text: 'Account Linked',
        description: `Linked to: ${user.goatedUsername}`,
        color: 'text-green-400',
        buttonText: 'Manage Linking',
        disabled: true, // For now, don't allow re-linking
      };
    }

    // For now, we'll assume no pending status since we don't have that in the user object
    // In a real implementation, you'd fetch the user's pending requests
    return {
      status: 'not_linked',
      icon: Link,
      text: 'Link Goated Account',
      description: 'Connect your Goated.com account to view your wager progress',
      color: 'text-[#D7FF00]',
      buttonText: 'Link Account',
      disabled: false,
    };
  };

  const linkingStatus = getLinkingStatus();
  const StatusIcon = linkingStatus.icon;

  const handleSuccess = () => {
    // In a real app, you'd refresh the user data here
    console.log('Linking request submitted successfully');
  };

  if (linkingStatus.status === 'linked' && !showStatus) {
    return null; // Don't show button if already linked and status display is disabled
  }

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {showStatus && (
          <div className="flex items-center gap-2 text-sm">
            <StatusIcon className={`h-4 w-4 ${linkingStatus.color}`} />
            <span className={linkingStatus.color}>{linkingStatus.text}</span>
          </div>
        )}
        
        {linkingStatus.description && showStatus && (
          <p className="text-xs text-gray-400">{linkingStatus.description}</p>
        )}

        {!linkingStatus.disabled && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant={variant}
              size={size}
              onClick={() => setIsModalOpen(true)}
              className={`${
                variant === 'default' 
                  ? 'bg-[#D7FF00] text-black hover:bg-[#D7FF00]/90' 
                  : ''
              }`}
            >
              <Link className="h-4 w-4 mr-2" />
              {linkingStatus.buttonText}
            </Button>
          </motion.div>
        )}

        {linkingStatus.status === 'linked' && showStatus && (
          <div className="text-xs text-gray-500">
            Account successfully verified and linked
          </div>
        )}
      </div>

      <LinkGoatedAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

// Compact version for headers/nav
export function LinkAccountBadge() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) {
    return null;
  }

  if (user.goatedLinked && user.goatedId) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
        <CheckCircle className="h-4 w-4 text-green-400" />
        <span className="text-xs text-green-400 font-medium">Linked</span>
      </div>
    );
  }

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 px-3 py-1 bg-[#D7FF00]/10 border border-[#D7FF00]/30 rounded-full hover:bg-[#D7FF00]/20 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link className="h-4 w-4 text-[#D7FF00]" />
        <span className="text-xs text-[#D7FF00] font-medium">Link Account</span>
      </motion.button>

      <LinkGoatedAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}