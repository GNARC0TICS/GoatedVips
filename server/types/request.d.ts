
import 'express';

declare module 'express' {
  interface Request {
    isAdminDomain?: boolean;
    isPublicDomain?: boolean;
  }
}
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      isAdminDomain?: boolean;
      user?: {
        id: number;
        username: string;
        email: string;
        isAdmin: boolean;
      };
    }
  }
}
