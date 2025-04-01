import { Router, Request, Response } from "express";
import { db } from "../../../db";
import { wagerOverrides } from "../../../db/schema/wager-overrides";
import { eq, and, isNull, desc } from "drizzle-orm";
import { z } from "zod";

const router = Router();

// Validation schema for creating/updating wager overrides
// Define the schema with more specific types
const wagerOverrideSchema = z.object({
  username: z.string().min(1, "Username is required"),
  goated_id: z.string().optional().nullable(),
  today_override: z.number().nullable().optional(),
  this_week_override: z.number().nullable().optional(),
  this_month_override: z.number().nullable().optional(),
  all_time_override: z.number().nullable().optional(),
  active: z.boolean().default(true),
  expires_at: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
});

/**
 * Get all wager overrides
 * GET /api/admin/wager-overrides
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const wagerOverridesList = await db.query.wagerOverrides.findMany({
      orderBy: [desc(wagerOverrides.created_at)]
    });
    
    return res.status(200).json({
      success: true,
      data: wagerOverridesList
    });
  } catch (error) {
    console.error("Error fetching wager overrides:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wager overrides",
      error: (error as Error).message
    });
  }
});

/**
 * Get a specific wager override by ID
 * GET /api/admin/wager-overrides/:id
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    const wagerOverride = await db.query.wagerOverrides.findFirst({
      where: eq(wagerOverrides.id, id)
    });
    
    if (!wagerOverride) {
      return res.status(404).json({
        success: false,
        message: "Wager override not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: wagerOverride
    });
  } catch (error) {
    console.error("Error fetching wager override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wager override",
      error: (error as Error).message
    });
  }
});

/**
 * Create a new wager override
 * POST /api/admin/wager-overrides
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const validationResult = wagerOverrideSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid wager override data",
        errors: validationResult.error.format()
      });
    }
    
    const data = validationResult.data;
    
    // Check if a wager override already exists for this username
    const existingOverride = await db.query.wagerOverrides.findFirst({
      where: and(
        eq(wagerOverrides.username, data.username),
        eq(wagerOverrides.active, true)
      )
    });
    
    if (existingOverride) {
      return res.status(409).json({
        success: false,
        message: `An active wager override already exists for user '${data.username}'`,
        existingId: existingOverride.id
      });
    }
    
    // Format the expiration date if provided
    let expiresAt = undefined;
    if (data.expires_at) {
      expiresAt = new Date(data.expires_at);
    }
    
    // Get the current admin username
    const adminUsername = (req.user as any)?.username || 'admin';
    
    // Insert the new wager override
    const insertedOverride = await db.insert(wagerOverrides).values({
      username: data.username,
      goated_id: data.goated_id || null,
      today_override: data.today_override !== undefined && data.today_override !== null 
        ? data.today_override.toString() 
        : null,
      this_week_override: data.this_week_override !== undefined && data.this_week_override !== null 
        ? data.this_week_override.toString() 
        : null,
      this_month_override: data.this_month_override !== undefined && data.this_month_override !== null 
        ? data.this_month_override.toString() 
        : null,
      all_time_override: data.all_time_override !== undefined && data.all_time_override !== null 
        ? data.all_time_override.toString() 
        : null,
      active: data.active,
      expires_at: expiresAt,
      created_by: adminUsername,
      notes: data.notes || null
    }).returning();
    
    return res.status(201).json({
      success: true,
      message: "Wager override created successfully",
      data: insertedOverride[0]
    });
  } catch (error) {
    console.error("Error creating wager override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create wager override",
      error: (error as Error).message
    });
  }
});

/**
 * Update an existing wager override
 * PUT /api/admin/wager-overrides/:id
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Validate the request body
    const validationResult = wagerOverrideSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid wager override data",
        errors: validationResult.error.format()
      });
    }
    
    const data = validationResult.data;
    
    // Check if the wager override exists
    const existingOverride = await db.query.wagerOverrides.findFirst({
      where: eq(wagerOverrides.id, id)
    });
    
    if (!existingOverride) {
      return res.status(404).json({
        success: false,
        message: "Wager override not found"
      });
    }
    
    // Format the expiration date if provided
    let expiresAt = undefined;
    if (data.expires_at) {
      expiresAt = new Date(data.expires_at);
    }
    
    // Update the wager override
    const updatedOverride = await db.update(wagerOverrides)
      .set({
        username: data.username,
        goated_id: data.goated_id || null,
        today_override: data.today_override !== undefined && data.today_override !== null 
          ? data.today_override.toString() 
          : null,
        this_week_override: data.this_week_override !== undefined && data.this_week_override !== null 
          ? data.this_week_override.toString() 
          : null,
        this_month_override: data.this_month_override !== undefined && data.this_month_override !== null 
          ? data.this_month_override.toString() 
          : null,
        all_time_override: data.all_time_override !== undefined && data.all_time_override !== null 
          ? data.all_time_override.toString() 
          : null,
        active: data.active,
        expires_at: expiresAt,
        notes: data.notes || null
      })
      .where(eq(wagerOverrides.id, id))
      .returning();
    
    return res.status(200).json({
      success: true,
      message: "Wager override updated successfully",
      data: updatedOverride[0]
    });
  } catch (error) {
    console.error("Error updating wager override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update wager override",
      error: (error as Error).message
    });
  }
});

/**
 * Deactivate a wager override (soft delete)
 * DELETE /api/admin/wager-overrides/:id
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format"
      });
    }
    
    // Check if the wager override exists
    const existingOverride = await db.query.wagerOverrides.findFirst({
      where: eq(wagerOverrides.id, id)
    });
    
    if (!existingOverride) {
      return res.status(404).json({
        success: false,
        message: "Wager override not found"
      });
    }
    
    // Deactivate the wager override (soft delete)
    const deactivatedOverride = await db.update(wagerOverrides)
      .set({
        active: false
      })
      .where(eq(wagerOverrides.id, id))
      .returning();
    
    return res.status(200).json({
      success: true,
      message: "Wager override deactivated successfully",
      data: deactivatedOverride[0]
    });
  } catch (error) {
    console.error("Error deactivating wager override:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to deactivate wager override",
      error: (error as Error).message
    });
  }
});

export default router;