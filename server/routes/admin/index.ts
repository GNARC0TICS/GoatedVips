import { Router } from "express";
import wagerOverridesRouter from "./wager-overrides";
import meRouter from "./me";

// Create admin router
const adminRouter = Router();

// Mount sub-routers for admin functionality
adminRouter.use("/wager-overrides", wagerOverridesRouter);
adminRouter.use("/me", meRouter);

export default adminRouter;