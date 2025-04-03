import { Router } from "express";
import { db } from "@db";
import { users } from "@db/schema";
import { verificationRequests, insertVerificationRequestSchema } from "@db/schema/verification";
import { eq, desc, sql, and } from "drizzle-orm";
import rateLimit from 'express-rate-limit';
import { z } from "zod";

const router = Router();

// Rate limiter middleware
const verificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 verification requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification requests from this IP, please try again later." }
});

// Create a new verification request
router.post("/request", verificationLimiter, async (req, res) => {
  try {
    // Validation schema
    const requestSchema = z.object({
      userId: z.number().optional(),
      goatedId: z.string(),
      goatedUsername: z.string(),
      telegramId: z.string(),
      telegramUsername: z.string(),
      proofImageUrl: z.string().optional(),
      notes: z.string().optional()
    });

    // Validate request data
    const result = requestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
        errors: result.error.issues
      });
    }

    const { goatedId, goatedUsername, telegramId, telegramUsername, notes } = result.data;
    let { userId } = result.data;

    // First, check if the user with this goatedId exists in our system
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.goatedId, goatedId))
      .limit(1);

    // If user doesn't exist, return error
    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User with this Goated ID not found in our system"
      });
    }

    // User exists, set userId
    userId = existingUser[0].id;

    // Check for existing pending requests for this user
    const existingRequest = await db
      .select()
      .from(verificationRequests)
      .where(
        and(
          eq(verificationRequests.userId, userId),
          eq(verificationRequests.status, "pending")
        )
      )
      .limit(1);

    if (existingRequest && existingRequest.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "You already have a pending verification request"
      });
    }

    // Create a new verification request
    const newVerificationRequest = {
      id: Math.floor(1000 + Math.random() * 9000), // Generate random ID for the request
      userId,
      telegramId,
      telegramUsername,
      goatedUsername,
      status: "pending",
      adminNotes: notes || null
    };

    // Insert the verification request using SQL to avoid type issues
    const insertResult = await db.execute(sql`
      INSERT INTO verification_requests (
        id, user_id, telegram_id, telegram_username, 
        goated_username, status, admin_notes
      ) VALUES (
        ${newVerificationRequest.id}, 
        ${newVerificationRequest.userId}, 
        ${newVerificationRequest.telegramId}, 
        ${newVerificationRequest.telegramUsername}, 
        ${newVerificationRequest.goatedUsername}, 
        ${newVerificationRequest.status}, 
        ${newVerificationRequest.adminNotes}
      ) RETURNING *
    `);

    res.status(201).json({
      status: "success",
      message: "Verification request submitted successfully",
      data: insertResult.rows && insertResult.rows.length > 0 
        ? insertResult.rows[0] 
        : { id: newVerificationRequest.id }
    });
  } catch (error) {
    console.error("Error creating verification request:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to submit verification request"
    });
  }
});

// Check verification status for a user
router.get("/status/:goatedId", async (req, res) => {
  try {
    const { goatedId } = req.params;

    // Find user by goatedId
    const user = await db
      .select()
      .from(users)
      .where(eq(users.goatedId, goatedId))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found"
      });
    }

    const userId = user[0].id;

    // Check if user is already verified
    if (user[0].goatedAccountLinked) {
      return res.json({
        status: "success",
        verified: true,
        message: "User is already verified"
      });
    }

    // Find latest verification request
    const request = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.requestedAt))
      .limit(1);

    if (!request || request.length === 0) {
      return res.json({
        status: "success",
        verified: false,
        requestExists: false,
        message: "No verification request found"
      });
    }

    // Return verification status
    res.json({
      status: "success",
      verified: request[0].status === "approved",
      requestStatus: request[0].status,
      requestExists: true,
      requestedAt: request[0].requestedAt,
      message: request[0].status === "approved" 
        ? "Verification approved" 
        : request[0].status === "rejected"
          ? "Verification rejected"
          : "Verification pending"
    });
  } catch (error) {
    console.error("Error checking verification status:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to check verification status"
    });
  }
});

// Admin route to list all verification requests
router.get("/admin/requests", async (req, res) => {
  try {
    // Check if user is admin (this check would be handled by middleware in production)
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    const status = req.query.status as string || "pending";
    const page = parseInt(req.query.page as string || "1");
    const limit = parseInt(req.query.limit as string || "10");
    const offset = (page - 1) * limit;

    // Get verification requests with joined user data
    const requests = await db.execute(sql`
      SELECT 
        vr.id, 
        vr.user_id, 
        vr.telegram_id, 
        vr.telegram_username, 
        vr.goated_username, 
        vr.status, 
        vr.verified_by, 
        vr.verified_at, 
        vr.requested_at, 
        vr.admin_notes,
        u.username,
        u.goated_id,
        u.email
      FROM verification_requests vr
      JOIN users u ON vr.user_id = u.id
      WHERE vr.status = ${status}
      ORDER BY vr.requested_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `);

    // Count total for pagination
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM verification_requests WHERE status = ${status}
    `);
    
    // Use a safe approach to get the count with fallback to 0
    const total = countResult.rows && countResult.rows.length > 0 
      ? parseInt(countResult.rows[0].count.toString()) || 0
      : 0;

    res.json({
      status: "success",
      data: requests.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error listing verification requests:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to list verification requests"
    });
  }
});

// Admin route to approve/reject verification request
router.post("/admin/action/:requestId", async (req, res) => {
  try {
    // Check if user is admin (this check would be handled by middleware in production)
    if (!req.user || !(req.user as any).isAdmin) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized"
      });
    }

    const { requestId } = req.params;
    const { action, notes } = req.body;

    if (action !== "approve" && action !== "reject") {
      return res.status(400).json({
        status: "error",
        message: "Invalid action, must be 'approve' or 'reject'"
      });
    }

    // Find the verification request
    const request = await db
      .select()
      .from(verificationRequests)
      .where(eq(verificationRequests.id, parseInt(requestId)))
      .limit(1);

    if (!request || request.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Verification request not found"
      });
    }

    const verificationRequest = request[0];

    // Update verification request status
    await db
      .update(verificationRequests)
      .set({
        status: action === "approve" ? "approved" : "rejected",
        verifiedBy: (req.user as any).username,
        verifiedAt: new Date(),
        adminNotes: notes || verificationRequest.adminNotes
      })
      .where(eq(verificationRequests.id, parseInt(requestId)));

    // If approved, update user record using SQL to avoid type issues
    if (action === "approve") {
      await db.execute(sql`
        UPDATE users
        SET 
          goated_account_linked = true,
          telegram_id = ${verificationRequest.telegramId},
          telegram_username = ${verificationRequest.telegramUsername}
        WHERE id = ${verificationRequest.userId}
      `);
    }

    res.json({
      status: "success",
      message: `Verification request ${action === "approve" ? "approved" : "rejected"} successfully`
    });
  } catch (error) {
    console.error("Error processing verification action:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process verification action"
    });
  }
});

export default router;