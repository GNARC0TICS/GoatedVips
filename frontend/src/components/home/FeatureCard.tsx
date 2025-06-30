// Compatibility wrapper for home features
import React from 'react';
import { FeatureCard as UnifiedFeatureCard } from '@/components/features/FeatureCard';
import { FeatureCardData } from '@/data/homeFeatures';
import { getIcon } from '@/lib/iconMap';

interface FeatureCardProps {
  feature: FeatureCardData;
  isAuthenticated: boolean;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isAuthenticated }) => {
  const {
    iconName,
    customIconComponent: CustomIcon,
    iconProps,
    title,
    description,
    link,
    requiresAuth,
    authSensitiveLink,
    badgeText,
    ctaText,
    ctaRequiresAuthAction,
  } = feature;

  const IconComponent = CustomIcon || getIcon(iconName);

  return (
    <UnifiedFeatureCard
      title={title}
      description={description}
      icon={IconComponent ? <IconComponent {...iconProps} /> : null}
      href={link}
      linkText={ctaText}
      badge={badgeText ? { text: badgeText } : undefined}
      authRequired={requiresAuth}
      isAuthenticated={isAuthenticated}
      ctaRequiresAuthAction={ctaRequiresAuthAction}
      authSensitiveLink={authSensitiveLink}
      enhanced={true} // Use enhanced styling for home
    />
  );
};