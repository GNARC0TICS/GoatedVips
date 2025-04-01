import { Router, Request, Response } from "express";

const router = Router();

/**
 * Get information about the currently logged-in admin user
 * GET /api/admin/me
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    // The user is already authenticated as an admin by the requireAdmin middleware
    const adminUser = req.user;
    
    // Return the admin information (excluding sensitive fields)
    if (adminUser) {
      // Extract only the needed fields from the user object
      const { id, username, email, isAdmin, createdAt } = req.user as any;
      
      res.status(200).json({
        id,
        username,
        email,
        isAdmin,
        createdAt,
        // Avoid exposing sensitive data like password, etc.
      });
    } else {
      // This shouldn't happen due to requireAdmin middleware, but just in case
      res.status(401).json({
        success: false,
        message: 'Not authenticated as admin'
      });
    }
  } catch (error) {
    console.error('Error getting admin information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin information',
      error: (error as Error).message
    });
  }
});

export default router;