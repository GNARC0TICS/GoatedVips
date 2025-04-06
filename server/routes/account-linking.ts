import { Router } from "express";
import { UserService } from "../services/user.service";
import { GoatedApiService } from "../services/goated-api.service";
import { db } from "@db";
import { users } from "@db/schema";
import { eq, sql } from "drizzle-orm";

const router = Router();
const userService = new UserService();
const goatedApiService = new GoatedApiService();

/**
 * Route to check if a Goated ID exists and is available for linking
 * GET /api/account/check-goated-id/:goatedId
 */
router.get("/check-goated-id/:goatedId", async (req, res) => {
  try {
    const { goatedId } = req.params;
    
    // Validate that the user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Check if the Goated ID exists in the API
    const apiUser = await goatedApiService.findUserByGoatedId(goatedId);
    
    if (!apiUser) {
      return res.status(404).json({
        success: false,
        message: "This Goated ID was not found in our system"
      });
    }
    
    // Check if this Goated ID is already linked to an account
    const existingLinked = await userService.findUserByGoatedId(goatedId);
    
    if (existingLinked && existingLinked.id !== req.user.id) {
      // It's already linked to another account
      // All accounts are considered permanent in this implementation
      return res.json({
        success: true,
        canLink: false,
        reason: "This Goated ID is already linked to another account"
      });
    }
    
    // Available for linking
    return res.json({
      success: true,
      canLink: true,
      goatedUsername: apiUser.name
    });
  } catch (error) {
    console.error("Error checking Goated ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check Goated ID"
    });
  }
});

/**
 * Route to initiate account linking
 * POST /api/account/link-account
 */
router.post("/link-account", async (req, res) => {
  try {
    const { goatedId } = req.body;
    
    // Validate that the user is authenticated
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentication required" 
      });
    }
    
    // Link the account
    await userService.linkGoatedAccount(req.user.id, goatedId, 'id_verification');
    
    return res.json({
      success: true,
      message: "Account linked successfully"
    });
  } catch (error) {
    console.error("Error linking account:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to link account"
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

export default router;