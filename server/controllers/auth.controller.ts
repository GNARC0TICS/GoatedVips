import { Request, Response } from 'express';
import { db } from '@db';
import { users } from '@db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken'; // Assuming jsonwebtoken is installed
import { encryptPassword, decryptPassword } from '../utils/encryption';

const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET_KEY environment variable is not set.');
  // throw new Error('JWT_SECRET_KEY environment variable is not set.');
}

const generateToken = (userId: number, username: string, isAdmin: boolean) => {
  if (!JWT_SECRET) throw new Error('JWT secret is not configured.');
  return jwt.sign({ id: userId, username, isAdmin }, JWT_SECRET, { expiresIn: '7d' }); // Token expires in 7 days
};

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  try {
    // Check if username or email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username).or(eq(users.email, email)),
    });

    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    const { iv, salt, encryptedText, authTag } = encryptPassword(password);

    const newUser = await db.insert(users).values({
      username,
      email,
      encryptedPassword: encryptedText,
      passwordIv: iv,
      passwordSalt: salt,
      passwordAuthTag: authTag,
      isAdmin: false, // Default to not admin
      // emailVerified: false, // Assuming email verification flow will be added
    }).returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
    });

    if (!newUser || newUser.length === 0) {
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const token = generateToken(newUser[0].id, newUser[0].username, newUser[0].isAdmin);
    return res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: newUser[0] 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body; // Or username, depending on login preference

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.encryptedPassword || !user.passwordIv || !user.passwordSalt || !user.passwordAuthTag) {
      return res.status(401).json({ message: 'Invalid credentials or user data incomplete' });
    }

    const decryptedPassword = decryptPassword({
      iv: user.passwordIv,
      salt: user.passwordSalt,
      encryptedText: user.encryptedPassword,
      authTag: user.passwordAuthTag,
    });

    if (decryptedPassword === null || decryptedPassword !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Successfully authenticated
    const token = generateToken(user.id, user.username, user.isAdmin);
    return res.status(200).json({ 
      message: 'Login successful', 
      token, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login' });
  }
};

// Placeholder for admin to view password (needs secure implementation and strong authZ)
export const viewUserPassword = async (req: Request, res: Response) => {
  // This is a HIGHLY SENSITIVE operation and needs robust admin authorization
  // For demonstration, assuming admin status is checked by a middleware before this handler
  const { userId } = req.params;
  
  try {
    const userToView = await db.query.users.findFirst({
      where: eq(users.id, Number(userId)),
      columns: {
        encryptedPassword: true,
        passwordIv: true,
        passwordSalt: true,
        passwordAuthTag: true,
      }
    });

    if (!userToView || !userToView.encryptedPassword || !userToView.passwordIv || !userToView.passwordSalt || !userToView.passwordAuthTag) {
      return res.status(404).json({ message: 'User not found or password data incomplete' });
    }

    const decryptedPassword = decryptPassword({
      iv: userToView.passwordIv,
      salt: userToView.passwordSalt,
      encryptedText: userToView.encryptedPassword,
      authTag: userToView.passwordAuthTag,
    });

    if (decryptedPassword === null) {
      return res.status(500).json({ message: 'Failed to decrypt password' });
    }

    return res.status(200).json({ username: userToView.username, /* temp remove for now: password: decryptedPassword */ plainPassword: decryptedPassword }); // Return plain password - EXTREME CAUTION
  } catch (error) {
    console.error(`Error viewing password for user ${userId}:`, error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}; 