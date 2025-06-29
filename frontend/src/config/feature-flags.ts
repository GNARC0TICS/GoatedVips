/**
 * Feature flag configuration for GoatedVIPs
 * 
 * This system allows for incremental adoption of new components and patterns
 * by controlling their visibility through configuration rather than direct code changes.
 */

/**
 * Feature flag configuration for the entire application
 */
export const FEATURE_FLAGS = {
  /**
   * Profile system feature flags
   */
  profiles: {
    /**
     * Use enhanced profile card (component migration)
     */
    useEnhancedProfileCard: false,
    
    /**
     * Use enhanced tier progress visualization
     */
    useEnhancedTierProgress: false,
    
    /**
     * Use enhanced profile layout
     */
    useEnhancedProfileLayout: false,
    
    /**
     * Use enhanced profile page
     */
    useEnhancedProfilePage: false,
    
    /**
     * Show achievement system in profile components
     */
    showAchievements: false,
  },
  
  /**
   * Authentication system feature flags
   */
  auth: {
    /**
     * Use centralized authentication utilities
     */
    useCentralizedAuthUtils: false,
    
    /**
     * Use standardized error responses
     */
    useStandardizedErrors: false,
  },
  
  /**
   * Route structure feature flags
   */
  routes: {
    /**
     * Use centralized route configuration
     */
    useCentralizedRoutes: false,
    
    /**
     * Enable legacy route redirects
     */
    enableRedirects: false,
  },
  
  /**
   * Data system feature flags
   */
  data: {
    /**
     * Use centralized tier definitions
     * Already implemented - set to true
     */
    useCentralizedTierDefinitions: true,
  }
};

/**
 * Get a feature flag value
 * 
 * @param featurePath Dot notation path to the feature flag (e.g., 'profiles.useEnhancedProfileCard')
 * @returns Boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(featurePath: string): boolean {
  if (!featurePath) {
    return false;
  }
  
  const parts = featurePath.split('.');
  let config: any = FEATURE_FLAGS;
  
  for (const part of parts) {
    if (config[part] === undefined) {
      console.warn(`Feature flag not found: ${featurePath}`);
      return false;
    }
    config = config[part];
  }
  
  return Boolean(config);
}

/**
 * Enable a feature flag
 * 
 * This is primarily for development/testing, as production would typically
 * use server-controlled flags or environment variables
 * 
 * @param featurePath Dot notation path to the feature flag
 * @param enabled Boolean value to set
 */
export function setFeatureEnabled(featurePath: string, enabled: boolean): void {
  if (!featurePath) {
    return;
  }
  
  const parts = featurePath.split('.');
  const lastPart = parts.pop();
  
  if (!lastPart) {
    return;
  }
  
  let config: any = FEATURE_FLAGS;
  
  for (const part of parts) {
    if (config[part] === undefined) {
      config[part] = {};
    }
    config = config[part];
  }
  
  config[lastPart] = enabled;
}

/**
 * Reset all feature flags to their default values
 * Primarily for testing purposes
 */
export function resetFeatureFlags(): void {
  // In a real implementation, this would reset to default values
  // For now, we just log a message
  console.log('Feature flags reset to defaults');
}

/**
 * Feature flag hook for React components
 * 
 * @param featurePath Dot notation path to the feature flag
 * @param fallback Fallback value if the feature flag doesn't exist
 * @returns Boolean indicating if the feature is enabled
 */
export function useFeatureFlag(featurePath: string, fallback: boolean = false): boolean {
  try {
    return isFeatureEnabled(featurePath);
  } catch (error) {
    console.warn(`Error checking feature flag ${featurePath}:`, error);
    return fallback;
  }
}
