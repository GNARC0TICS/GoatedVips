
import 'express';

declare module 'express' {
  interface Request {
    isAdminDomain?: boolean;
    isPublicDomain?: boolean;
  }
}
