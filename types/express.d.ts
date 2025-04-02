import { User as SupabaseUser } from '@supabase/supabase-js';

declare global {
  namespace Express {
    // Extend the Request interface to include user property
    interface Request {
      user?: (SupabaseUser & { isAdmin: boolean }) | null;
    }
  }
}