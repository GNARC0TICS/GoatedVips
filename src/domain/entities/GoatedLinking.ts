import { z } from 'zod';

export const VerificationMethod = z.enum(['email', 'transaction', 'support_ticket', 'screenshot', 'other']);
export type VerificationMethod = z.infer<typeof VerificationMethod>;

export const LinkingRequestStatus = z.enum(['pending', 'approved', 'rejected', 'under_review']);
export type LinkingRequestStatus = z.infer<typeof LinkingRequestStatus>;

export const VerificationResult = z.enum(['success', 'failed', 'partial']);
export type VerificationResult = z.infer<typeof VerificationResult>;

export const GoatedLinkingRequest = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  
  // User's claim information
  claimedGoatedId: z.string().min(1).max(50),
  claimedGoatedUsername: z.string().min(1).max(100),
  
  // Verification information provided by user
  verificationMethod: VerificationMethod,
  verificationData: z.string().optional(), // Email, transaction ID, ticket number, etc.
  userMessage: z.string().max(1000).optional(), // User's explanation/proof
  
  // Request status
  status: LinkingRequestStatus.default('pending'),
  
  // Admin review
  reviewedBy: z.string().uuid().optional(),
  reviewedAt: z.date().optional(),
  adminNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  
  // Verification details
  externalDataVerified: z.boolean().default(false),
  wagerDataMatches: z.boolean().default(false),
  identityVerified: z.boolean().default(false),
  
  // Request metadata
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  requestSource: z.string().default('web'),
  
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GoatedLinkingRequest = z.infer<typeof GoatedLinkingRequest>;

export const CreateLinkingRequestInput = z.object({
  claimedGoatedId: z.string().min(1).max(50),
  claimedGoatedUsername: z.string().min(1).max(100),
  verificationMethod: VerificationMethod,
  verificationData: z.string().max(500).optional(),
  userMessage: z.string().max(1000).optional(),
});

export type CreateLinkingRequestInput = z.infer<typeof CreateLinkingRequestInput>;

export const ReviewLinkingRequestInput = z.object({
  requestId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_more_info']),
  adminNotes: z.string().min(1).max(1000),
  rejectionReason: z.string().max(500).optional(),
  // Verification flags
  externalDataVerified: z.boolean().optional(),
  wagerDataMatches: z.boolean().optional(),
  identityVerified: z.boolean().optional(),
});

export type ReviewLinkingRequestInput = z.infer<typeof ReviewLinkingRequestInput>;

export const LinkingVerificationLog = z.object({
  id: z.string().uuid(),
  linkingRequestId: z.string().uuid(),
  
  // Verification attempt details
  verificationType: z.enum(['email_check', 'wager_verification', 'manual_review', 'external_api_check']),
  verificationResult: VerificationResult,
  
  // Details of the verification
  verificationData: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  
  // Who performed the verification
  performedBy: z.string().uuid().optional(),
  performedByType: z.enum(['admin', 'system', 'external_api']).default('admin'),
  
  createdAt: z.date(),
});

export type LinkingVerificationLog = z.infer<typeof LinkingVerificationLog>;

export const GoatedLinkingHistory = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  
  // Linking details
  goatedId: z.string(),
  goatedUsername: z.string(),
  
  // Linking metadata
  linkedBy: z.string().uuid(),
  linkingRequestId: z.string().uuid().optional(),
  
  // Status tracking
  status: z.enum(['active', 'unlinked', 'transferred']).default('active'),
  unlinkReason: z.string().optional(),
  unlinkedBy: z.string().uuid().optional(),
  unlinkedAt: z.date().optional(),
  
  // Timestamps
  linkedAt: z.date(),
  createdAt: z.date(),
});

export type GoatedLinkingHistory = z.infer<typeof GoatedLinkingHistory>;

// Input schemas for API operations
export const UserLinkingRequestInput = CreateLinkingRequestInput.extend({
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the linking terms and conditions"
  }),
});

export type UserLinkingRequestInput = z.infer<typeof UserLinkingRequestInput>;

export const BulkLinkingOperationInput = z.object({
  operations: z.array(z.object({
    requestId: z.string().uuid(),
    action: z.enum(['approve', 'reject']),
    adminNotes: z.string().optional(),
  })).min(1).max(50),
  bulkReason: z.string().min(1).max(500),
});

export type BulkLinkingOperationInput = z.infer<typeof BulkLinkingOperationInput>;

// Validation schemas for different verification methods
export const EmailVerificationData = z.object({
  email: z.string().email(),
  confirmationCode: z.string().optional(),
});

export const TransactionVerificationData = z.object({
  transactionId: z.string().min(1),
  amount: z.number().positive().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

export const SupportTicketVerificationData = z.object({
  ticketNumber: z.string().min(1),
  ticketPlatform: z.string().optional(), // 'discord', 'email', 'live_chat'
  submissionDate: z.string().optional(),
});

export const ScreenshotVerificationData = z.object({
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  additionalInfo: z.string().optional(),
});

// Helper function to validate verification data based on method
export function validateVerificationDataForMethod(
  method: VerificationMethod, 
  data: string
): { isValid: boolean; parsedData?: any; error?: string } {
  try {
    const parsedData = JSON.parse(data);
    
    switch (method) {
      case 'email':
        EmailVerificationData.parse(parsedData);
        return { isValid: true, parsedData };
        
      case 'transaction':
        TransactionVerificationData.parse(parsedData);
        return { isValid: true, parsedData };
        
      case 'support_ticket':
        SupportTicketVerificationData.parse(parsedData);
        return { isValid: true, parsedData };
        
      case 'screenshot':
        ScreenshotVerificationData.parse(parsedData);
        return { isValid: true, parsedData };
        
      case 'other':
        // For 'other', just ensure it's a non-empty string
        if (typeof parsedData === 'string' && parsedData.length > 0) {
          return { isValid: true, parsedData };
        }
        return { isValid: false, error: 'Other verification method requires descriptive text' };
        
      default:
        return { isValid: false, error: 'Unknown verification method' };
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Invalid verification data format' 
    };
  }
}