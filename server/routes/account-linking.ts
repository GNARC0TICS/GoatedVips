import { Router } from 'express';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import userService from '../services/userService';
import goatedApiService from '../services/goatedApiService';

const router = Router();

/**
 * Route to request account linking (user initiated)
 * POST /api/account/request-link
 */
router.post("/request-link", async (req, res) => {
  try {
    const { goatedUsername } = req.body;
    
    // Validate that the user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Request account linking
    const result = await userService.requestGoatedAccountLink(String(req.user.id), goatedUsername);
    
    return res.json(result);
  } catch (error) {
    console.error("Error requesting account link:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to request account linking"
    });
  }
});

/**
 * Route to unlink an account
 * POST /api/account/unlink-account
 */
router.post("/unlink-account", async (req, res) => {
  try {
    // Validate that the user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Check if user has a linked account
    if (!req.user.goatedId) {
      return res.status(400).json({
        success: false,
        message: "No linked account to unlink"
      });
    }
    
    // Unlink the account
    await db.update(users)
      .set({
        goatedId: null,
        goatedUsername: null,
        goatedAccountLinked: false,
        lastActive: new Date()
      })
      .where(eq(users.id, req.user.id));
    
    return res.json({
      success: true,
      message: "Account unlinked successfully"
    });
  } catch (error) {
    console.error("Error unlinking account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unlink account"
    });
  }
});

/**
 * Route to check if a Goated username exists
 * GET /api/account/check-goated-username/:username
 */
router.get("/check-goated-username/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    // Validate that the user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Check if the Goated username exists
    const goatedCheck = await goatedApiService.checkGoatedUsername(username);
    
    // Return the check result
    return res.json(goatedCheck);
  } catch (error) {
    console.error("Error checking Goated username:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check Goated username"
    });
  }
});

/**
 * Route for admin to approve account linking
 * POST /api/account/admin-approve-link
 */
router.post("/admin-approve-link", async (req, res) => {
  try {
    const { userId, goatedId } = req.body;
    
    // Validate that the user is authenticated and is an admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin authorization required" 
      });
    }
    
    // Approve the link
    const updatedUser = await userService.approveGoatedAccountLink(
      userId,
      goatedId,
      req.user.username
    );
    
    return res.json({
      success: true,
      message: `Account link approved for ${updatedUser.username}`,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error approving account link:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to approve account link"
    });
  }
});

/**
 * Route for admin to reject account linking
 * POST /api/account/admin-reject-link
 */
router.post("/admin-reject-link", async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    // Validate that the user is authenticated and is an admin
    if (!req.user || !req.user.isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: "Admin authorization required" 
      });
    }
    
    // Reject the link
    const result = await userService.rejectGoatedAccountLink(
      userId,
      reason || "Rejected by admin",
      req.user.username
    );
    
    return res.json(result);
  } catch (error) {
    console.error("Error rejecting account link:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to reject account link"
    });
  }
});

export default router;